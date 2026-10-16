import { mockBackend, subscribeMockSse, emitMockSse } from './mock.js';

const USE_MOCK_ENV = import.meta.env.VITE_MOCK === 'true';
let forceMockMode = USE_MOCK_ENV;

export function setForceMock(val) {
  forceMockMode = Boolean(val);
}

export function isMockMode() {
  return forceMockMode;
}

async function request(endpoint, options = {}) {
  if (forceMockMode) {
    return null; // Signals caller to use mock
  }

  try {
    const res = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Check if proxy returned an HTML error (e.g. ECONNREFUSED from Vite proxy when port 4000 is not running)
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok && (res.status >= 500 || contentType.includes('text/html'))) {
      console.warn(`Backend /api${endpoint} returned ${res.status}, using mock backend.`);
      return null;
    }

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return { ok: false, ...errBody, status: res.status };
    }
    return await res.json();
  } catch (err) {
    console.warn(`Fetch /api${endpoint} failed, using mock backend:`, err.message);
    return null;
  }
}

export const api = {
  async getHealth() {
    if (!forceMockMode) {
      const res = await request('/health');
      if (res && res.sip) return res;
    }
    return mockBackend.getHealth();
  },

  async identifyPatron({ identifier, source = 'card' }) {
    if (!forceMockMode) {
      const res = await request('/patron/identify', {
        method: 'POST',
        body: JSON.stringify({ identifier, source }),
      });
      if (res && (res.ok !== undefined)) return res;
    }
    return mockBackend.identifyPatron({ identifier, source });
  },

  async checkout({ sessionToken, itemBarcode }) {
    if (!forceMockMode) {
      const res = await request('/checkout', {
        method: 'POST',
        body: JSON.stringify({ sessionToken, itemBarcode }),
      });
      if (res && (res.ok !== undefined)) return res;
    }
    return mockBackend.checkout({ sessionToken, itemBarcode });
  },

  async checkin({ itemBarcode }) {
    if (!forceMockMode) {
      const res = await request('/checkin', {
        method: 'POST',
        body: JSON.stringify({ itemBarcode }),
      });
      if (res && (res.ok !== undefined)) return res;
    }
    return mockBackend.checkin({ itemBarcode });
  },

  async renew({ sessionToken, itemBarcode }) {
    if (!forceMockMode) {
      const res = await request('/renew', {
        method: 'POST',
        body: JSON.stringify({ sessionToken, itemBarcode }),
      });
      if (res && (res.ok !== undefined)) return res;
    }
    return mockBackend.renew({ sessionToken, itemBarcode });
  },

  async renewAll({ sessionToken }) {
    if (!forceMockMode) {
      const res = await request('/renew-all', {
        method: 'POST',
        body: JSON.stringify({ sessionToken }),
      });
      if (res && res.results) return res;
    }
    return mockBackend.renewAll({ sessionToken });
  },

  async endSession({ sessionToken }) {
    if (!forceMockMode) {
      const res = await request('/session/end', {
        method: 'POST',
        body: JSON.stringify({ sessionToken }),
      });
      if (res) return res;
    }
    return mockBackend.endSession({ sessionToken });
  },

  async getStats() {
    if (!forceMockMode) {
      const res = await request('/stats');
      if (res && res.today) return res;
    }
    return mockBackend.getStats();
  },

  async simulateRfidTag({ itemBarcode }) {
    if (!forceMockMode) {
      const res = await request('/rfid/simulate-tag', {
        method: 'POST',
        body: JSON.stringify({ itemBarcode }),
      });
      if (res) return res;
    }
    return mockBackend.simulateRfidTag({ itemBarcode });
  },

  async passGate({ itemBarcode }) {
    if (!forceMockMode) {
      const res = await request('/gate/pass', {
        method: 'POST',
        body: JSON.stringify({ itemBarcode }),
      });
      if (res && (res.alarm !== undefined)) return res;
    }
    return mockBackend.passGate({ itemBarcode });
  },

  async enrollFace({ sessionToken, descriptor, consent }) {
    if (!forceMockMode) {
      const res = await request('/face/enroll', {
        method: 'POST',
        body: JSON.stringify({ sessionToken, descriptor, consent }),
      });
      if (res) return res;
    }
    return mockBackend.enrollFace({ sessionToken, descriptor, consent });
  },

  async verifyFace({ sessionToken, descriptor }) {
    if (!forceMockMode) {
      const res = await request('/face/verify', {
        method: 'POST',
        body: JSON.stringify({ sessionToken, descriptor }),
      });
      if (res) return res;
    }
    return mockBackend.verifyFace({ sessionToken, descriptor });
  },

  subscribeEvents(onMessage) {
    if (forceMockMode || typeof EventSource === 'undefined') {
      return subscribeMockSse(onMessage);
    }

    try {
      const es = new EventSource('/api/events');
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onMessage(data);
        } catch (err) {
          console.error('Failed to parse SSE data', err);
        }
      };
      es.onerror = () => {
        es.close();
        subscribeMockSse(onMessage);
      };
      return () => es.close();
    } catch {
      return subscribeMockSse(onMessage);
    }
  },

  emitMockSse,
};
