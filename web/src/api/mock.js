// In-memory mock server for NFSU Kiosk matching Koha SIP2 backend API contract
import { DEMO_CONFIG } from '../demoIds.js';

const BOOKS = {
  'NFSU-B-0001': { title: 'Forensic Ballistics & Firearms Identification', author: 'Dr. B. R. Sharma' },
  'NFSU-B-0002': { title: 'Principles of Forensic Medicine & Toxicology', author: 'Dr. K. S. Reddy' },
  'NFSU-B-0003': { title: 'Digital Forensics & Cyber Crime Analysis', author: 'E. Casey' },
  'NFSU-B-0004': { title: 'Fingerprint Recognition & Biometrics', author: 'D. Maltoni' },
  'NFSU-B-0005': { title: 'DNA Profiling in Criminal Investigations', author: 'J. M. Butler' },
};

// Items currently issued (used by security gate simulator)
const issuedItems = new Set(['NFSU-B-0001', 'NFSU-B-0002']);

const PATRONS = {
  'NFSU2026001': {
    id: 'NFSU2026001',
    displayName: 'Aarav Sharma',
    maskedId: 'NF••••6001',
    program: 'M.Sc. Forensic Science (Sem III)',
    chargedItems: [
      { barcode: 'NFSU-B-0001', title: 'Forensic Ballistics & Firearms Identification', dueDate: '20261028    235959' },
      { barcode: 'NFSU-B-0002', title: 'Principles of Forensic Medicine & Toxicology', dueDate: '20261012    235959' },
    ],
    chargedCount: 2,
    overdueCount: 1,
    holdCount: 1,
    feeAmount: '₹ 50.00',
    messages: ['Please clear overdue fine of ₹50.00 at the library desk.'],
    status: 'ACTIVE',
  },
  'NFSU2026002': {
    id: 'NFSU2026002',
    displayName: 'Dr. Priya Patel',
    maskedId: 'NF••••6002',
    program: 'Faculty — School of Cyber Security',
    chargedItems: [
      { barcode: 'NFSU-B-0003', title: 'Digital Forensics & Cyber Crime Analysis', dueDate: '20261120    235959' },
    ],
    chargedCount: 1,
    overdueCount: 0,
    holdCount: 0,
    feeAmount: '₹ 0.00',
    messages: ['Welcome to NFSU Central Library Kiosk.'],
    status: 'ACTIVE',
  },
  'NFSU2026099': {
    id: 'NFSU2026099',
    displayName: 'Suspended Patron',
    status: 'BLOCKED',
  }
};

let activeSessions = new Map();
let statsData = {
  today: { checkout: 14, checkin: 9, renew: 6 },
  successRate: 0.98,
  avgLatencyMs: 42,
  recent: [
    { id: 1, type: 'checkout', barcode: 'NFSU-B-0001', patronMask: 'NF••••6001', status: 'OK', time: '14:02:11' },
    { id: 2, type: 'checkin', barcode: 'NFSU-B-0004', patronMask: '—', status: 'OK', time: '13:58:34' },
    { id: 3, type: 'renew', barcode: 'NFSU-B-0003', patronMask: 'NF••••6002', status: 'OK', time: '13:45:00' },
  ]
};

const sseListeners = new Set();

export function emitMockSse(event) {
  for (const cb of sseListeners) {
    try { cb(event); } catch (e) { console.error(e); }
  }
}

export function subscribeMockSse(cb) {
  sseListeners.add(cb);
  return () => sseListeners.delete(cb);
}

function getFutureSipDate(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const z2 = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${z2(d.getMonth() + 1)}${z2(d.getDate())}    235959`;
}

export const mockBackend = {
  async getHealth() {
    return {
      ok: true,
      sip: 'connected',
      mode: 'mock',
      latencyMs: 38 + Math.floor(Math.random() * 15),
    };
  },

  async identifyPatron({ identifier, source }) {
    await new Promise((r) => setTimeout(r, 350));
    const cleanId = String(identifier || '').trim().toUpperCase();

    let patron = PATRONS[cleanId];
    if (!patron) {
      if (cleanId.includes('001')) patron = PATRONS['NFSU2026001'];
      else if (cleanId.includes('002')) patron = PATRONS['NFSU2026002'];
      else if (cleanId.includes('099') || cleanId.includes('BLOCK')) patron = PATRONS['NFSU2026099'];
      else if (cleanId.length >= 4) {
        patron = {
          id: cleanId,
          displayName: `Student ${cleanId.slice(-4)}`,
          maskedId: `${cleanId.slice(0, 2)}••••${cleanId.slice(-4)}`,
          program: 'NFSU Scholar',
          chargedItems: [],
          chargedCount: 0,
          overdueCount: 0,
          holdCount: 0,
          feeAmount: '₹ 0.00',
          messages: ['Card verified by Koha ILMS.'],
          status: 'ACTIVE'
        };
        PATRONS[cleanId] = patron;
      }
    }

    if (!patron) {
      return {
        ok: false,
        code: 'INVALID_PATRON',
        message: 'Patron record not found in Koha. Please check your card or visit the circulation desk.',
      };
    }

    if (patron.status === 'BLOCKED') {
      return {
        ok: false,
        code: 'PATRON_BLOCKED',
        message: 'Borrowing privileges suspended in Koha. Outstanding dues or holds exist. Please see staff.',
      };
    }

    const sessionToken = 'tok_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now();
    activeSessions.set(sessionToken, { patronId: patron.id, createdAt: Date.now() });

    return {
      ok: true,
      sessionToken,
      patron: {
        displayName: patron.displayName,
        maskedId: patron.maskedId,
        chargedCount: patron.chargedItems.length,
        overdueCount: patron.overdueCount,
        holdCount: patron.holdCount,
        feeAmount: patron.feeAmount,
        chargedItems: [...patron.chargedItems],
        messages: patron.messages || [],
      },
    };
  },

  async checkout({ sessionToken, itemBarcode }) {
    await new Promise((r) => setTimeout(r, 450));
    const session = activeSessions.get(sessionToken);
    if (!session) {
      return { ok: false, code: 'INVALID_SESSION', message: 'Session expired. Please tap your card again.' };
    }

    const cleanBarcode = String(itemBarcode || '').trim().toUpperCase();
    if (cleanBarcode.includes('ERR') || cleanBarcode.includes('999')) {
      return {
        ok: false,
        code: 'ITEM_NOT_FOUND',
        message: 'Barcode not found in Koha catalog. Please contact library staff.',
      };
    }

    const book = BOOKS[cleanBarcode] || {
      title: `Library Material [${cleanBarcode}]`,
      author: 'NFSU Press'
    };

    const dueDate = getFutureSipDate(14);
    issuedItems.add(cleanBarcode);

    const patron = PATRONS[session.patronId];
    if (patron) {
      const alreadyHas = patron.chargedItems.some(i => i.barcode === cleanBarcode);
      if (!alreadyHas) {
        patron.chargedItems.unshift({ barcode: cleanBarcode, title: book.title, dueDate });
        patron.chargedCount = patron.chargedItems.length;
      }
    }

    statsData.today.checkout++;
    statsData.recent.unshift({
      id: Date.now(),
      type: 'checkout',
      barcode: cleanBarcode,
      patronMask: patron ? patron.maskedId : 'PATRON',
      status: 'OK',
      time: new Date().toLocaleTimeString(),
    });

    emitMockSse({ type: 'txn', action: 'checkout', barcode: cleanBarcode, patronId: patron?.maskedId });

    return {
      ok: true,
      title: book.title,
      dueDate,
      reconciled: true,
      message: 'Checkout successful. Due date updated in Koha.',
      rfid: { action: 'SECURITY_DEACTIVATED', afi: '0xC2' },
    };
  },

  async checkin({ itemBarcode }) {
    await new Promise((r) => setTimeout(r, 450));
    const cleanBarcode = String(itemBarcode || '').trim().toUpperCase();

    if (cleanBarcode.includes('ERR') || cleanBarcode.includes('999')) {
      return {
        ok: false,
        code: 'ITEM_NOT_FOUND',
        message: 'Barcode unrecognized by Koha circulation system.',
      };
    }

    const book = BOOKS[cleanBarcode] || {
      title: `Library Material [${cleanBarcode}]`,
    };

    issuedItems.delete(cleanBarcode);

    for (const p of Object.values(PATRONS)) {
      if (p.chargedItems) {
        p.chargedItems = p.chargedItems.filter((i) => i.barcode !== cleanBarcode);
        p.chargedCount = p.chargedItems.length;
      }
    }

    const isHold = cleanBarcode === 'NFSU-B-0002';
    const sortBin = isHold ? 'BIN-HOLD-RESERVE' : 'BIN-MAIN-SHELVES';
    const alert = isHold ? 'Place on RESERVED / HOLD shelf for next patron' : 'Reshelve in standard stacks';

    statsData.today.checkin++;
    statsData.recent.unshift({
      id: Date.now(),
      type: 'checkin',
      barcode: cleanBarcode,
      patronMask: '—',
      status: 'OK',
      time: new Date().toLocaleTimeString(),
    });

    emitMockSse({ type: 'txn', action: 'checkin', barcode: cleanBarcode });

    return {
      ok: true,
      title: book.title,
      alert,
      sortBin,
      message: 'Item returned successfully. Security bit reactivated.',
      rfid: { action: 'SECURITY_ACTIVATED', afi: '0x07' },
    };
  },

  async renew({ sessionToken, itemBarcode }) {
    await new Promise((r) => setTimeout(r, 400));
    const session = activeSessions.get(sessionToken);
    if (!session) {
      return { ok: false, code: 'INVALID_SESSION', message: 'Session expired.' };
    }

    const cleanBarcode = String(itemBarcode || '').trim().toUpperCase();
    const patron = PATRONS[session.patronId];
    const item = patron?.chargedItems.find((i) => i.barcode === cleanBarcode);

    if (!item) {
      return { ok: false, message: 'Item not found in patron record.' };
    }

    const newDueDate = getFutureSipDate(14);
    item.dueDate = newDueDate;

    statsData.today.renew++;
    statsData.recent.unshift({
      id: Date.now(),
      type: 'renew',
      barcode: cleanBarcode,
      patronMask: patron.maskedId,
      status: 'OK',
      time: new Date().toLocaleTimeString(),
    });

    return {
      ok: true,
      title: item.title,
      dueDate: newDueDate,
      message: 'Renewal confirmed by Koha.',
    };
  },

  async renewAll({ sessionToken }) {
    await new Promise((r) => setTimeout(r, 500));
    const session = activeSessions.get(sessionToken);
    if (!session) {
      return { results: [] };
    }

    const patron = PATRONS[session.patronId];
    if (!patron || !patron.chargedItems) return { results: [] };

    const results = patron.chargedItems.map((item) => {
      const newDueDate = getFutureSipDate(14);
      item.dueDate = newDueDate;
      statsData.today.renew++;
      return {
        barcode: item.barcode,
        ok: true,
        title: item.title,
        dueDate: newDueDate,
        message: 'Renewed',
      };
    });

    return { results };
  },

  async endSession({ sessionToken }) {
    if (sessionToken) {
      activeSessions.delete(sessionToken);
    }
    return { ok: true };
  },

  async getStats() {
    return { ...statsData };
  },

  async simulateRfidTag({ itemBarcode }) {
    emitMockSse({ type: 'rfid_tag', barcode: itemBarcode });
    return { ok: true, sent: itemBarcode };
  },

  async passGate({ itemBarcode }) {
    const cleanBarcode = String(itemBarcode || '').trim().toUpperCase();
    const isIssued = issuedItems.has(cleanBarcode);
    const alarm = !isIssued;

    if (alarm) {
      emitMockSse({ type: 'gate_alarm', barcode: cleanBarcode, timestamp: Date.now() });
    }

    return {
      alarm,
      itemBarcode: cleanBarcode,
      status: alarm ? 'UNAUTHORIZED_MATERIAL' : 'PERMITTED_EXIT',
      message: alarm ? 'Security alarm triggered! Item is not checked out.' : 'Item legitimately issued. Security gate clear.',
    };
  },

  async enrollFace({ sessionToken, descriptor, consent }) {
    return { ok: true, message: 'Biometric face descriptor enrolled securely.' };
  },

  async verifyFace({ sessionToken, descriptor }) {
    return { match: true, distance: 0.28 };
  }
};
