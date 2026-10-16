import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header.jsx';
import { IdleScreen } from './screens/IdleScreen.jsx';
import { PatronHomeScreen } from './screens/PatronHomeScreen.jsx';
import { BorrowScreen } from './screens/BorrowScreen.jsx';
import { ReturnScreen } from './screens/ReturnScreen.jsx';
import { SummaryScreen } from './screens/SummaryScreen.jsx';
import { StaffDashboard } from './screens/StaffDashboard.jsx';
import { GateSimulator } from './screens/GateSimulator.jsx';
import { FaceLivenessScreen } from './screens/FaceLivenessScreen.jsx';
import { KeypadModal } from './components/KeypadModal.jsx';
import { SessionTimeoutModal } from './components/SessionTimeoutModal.jsx';
import { api, setForceMock } from './api/index.js';
import { DEMO_CONFIG } from './demoIds.js';
import { useScanner } from './hooks/useScanner.js';
import { translations } from './i18n.js';
import { playSuccessSound, playErrorSound, playScanBeep } from './utils/audio.js';
import { speak } from './utils/voice.js';

export function App() {
  // Navigation: 'idle' | 'home' | 'borrow' | 'return' | 'summary' | 'staff' | 'gate' | 'face'
  const [screen, setScreen] = useState('idle');
  
  // Patron session state (IN MEMORY ONLY - NEVER localStorage)
  const [sessionToken, setSessionToken] = useState(null);
  const [patron, setPatron] = useState(null);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [returnedItems, setReturnedItems] = useState([]);
  const [renewedItems, setRenewedItems] = useState([]);

  // System & Health Status
  const [sipStatus, setSipStatus] = useState('connected');
  const [lang, setLang] = useState('en');
  const [contrast, setContrast] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [ariaAnnouncement, setAriaAnnouncement] = useState('');

  // Inactivity safety: 60s idle limit with 10s countdown modal
  const [idleSeconds, setIdleSeconds] = useState(0);
  const [isTimeoutModalOpen, setIsTimeoutModalOpen] = useState(false);
  const IDLE_LIMIT = 60;
  const WARNING_THRESHOLD = 50; // starts warning at 50s (10s left)

  const t = translations[lang] || translations.en;

  // Poll /api/health every 10s
  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      try {
        const h = await api.getHealth();
        if (active && h) {
          setSipStatus(h.sip === 'connected' ? 'connected' : 'disconnected');
        }
      } catch {
        if (active) setSipStatus('disconnected');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Support direct screen preview via ?screen=home|borrow|return|summary|keypad|timeout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialScreen = params.get('screen');

    if (initialScreen) {
      if (initialScreen === 'keypad') {
        setIsKeypadOpen(true);
      } else if (['home', 'borrow', 'summary'].includes(initialScreen)) {
        const demoPatron = {
          displayName: 'Aarav Sharma',
          maskedId: 'NF••••1001',
          chargedItems: [
            { barcode: 'BOOK-101', title: 'Forensic Ballistics & Firearms Identification', dueDate: '20261028    235959' },
            { barcode: 'BOOK-102', title: 'Principles of Forensic Medicine & Toxicology', dueDate: '20261012    235959' },
          ],
          chargedCount: 2,
          overdueCount: 1,
          holdCount: 1,
          feeAmount: '₹ 50.00',
          messages: ['Please clear overdue fine of ₹50.00 at the library desk.'],
        };
        setSessionToken('demo_token');
        setPatron(demoPatron);
        setScreen(initialScreen);

        if (initialScreen === 'borrow') {
          setBorrowedItems([
            {
              id: '1',
              barcode: 'BOOK-103',
              title: 'Digital Forensics & Cyber Crime Analysis',
              status: 'SUCCESS',
              dueDate: '20261030    235959',
              message: 'Checkout successful. Due date updated in Koha.',
              timestamp: new Date(),
            },
            {
              id: '2',
              barcode: 'BOOK-104',
              title: 'Handbook of Fingerprint Recognition',
              status: 'PENDING',
              dueDate: null,
              message: 'Confirming with Koha…',
              timestamp: new Date(),
            }
          ]);
        }

        if (initialScreen === 'summary') {
          setBorrowedItems([
            {
              id: '1',
              barcode: 'BOOK-103',
              title: 'Digital Forensics & Cyber Crime Analysis',
              status: 'SUCCESS',
              dueDate: '20261030    235959',
            }
          ]);
          setReturnedItems([
            {
              id: '2',
              barcode: 'BOOK-102',
              title: 'Principles of Forensic Medicine & Toxicology',
              status: 'SUCCESS',
              sortBin: 'BIN-HOLD-RESERVE',
            }
          ]);
        }
      } else if (['return', 'staff', 'gate', 'face'].includes(initialScreen)) {
        setScreen(initialScreen);
      }
    }
  }, []);

  // Update root CSS font scale and contrast
  useEffect(() => {
    document.documentElement.style.setProperty('--kiosk-font-scale', fontScale);
    if (contrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [fontScale, contrast]);

  // Reset idle timer on user activity
  const resetIdleTimer = useCallback(() => {
    setIdleSeconds(0);
    setIsTimeoutModalOpen(false);
  }, []);

  useEffect(() => {
    const handleActivity = () => {
      if (sessionToken) {
        resetIdleTimer();
      }
    };

    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [sessionToken, resetIdleTimer]);

  // Inactivity countdown ticker
  useEffect(() => {
    if (!sessionToken || screen === 'idle' || screen === 'summary') {
      setIsTimeoutModalOpen(false);
      setIdleSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      setIdleSeconds((prev) => {
        const next = prev + 1;
        if (next >= IDLE_LIMIT) {
          // Time expired — end session securely
          handleEndSession(true);
          return 0;
        }
        if (next >= WARNING_THRESHOLD) {
          setIsTimeoutModalOpen(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionToken, screen]);

  // Announce for aria-live screen readers
  const announce = (text) => {
    setAriaAnnouncement(text);
  };

  // Patron Identification (via card tap, barcode scan, or keypad)
  const handleIdentifyPatron = async (identifier, source = 'card') => {
    setErrorMessage(null);
    announce(`Identifying patron card ${identifier}`);

    try {
      const res = await api.identifyPatron({ identifier, source });

      if (res?.ok && res.sessionToken) {
        playSuccessSound();
        setSessionToken(res.sessionToken);
        setPatron(res.patron);
        setBorrowedItems([]);
        setReturnedItems([]);
        setRenewedItems([]);
        setScreen('home');
        announce(`Welcome ${res.patron.displayName}`);
        speak(`${t.welcome} ${res.patron.displayName}`, lang);
      } else {
        playErrorSound();
        const code = res?.code;
        let msg = res?.message || t.genericError;
        if (code === 'INVALID_PATRON') msg = t.invalidPatron;
        if (code === 'PATRON_BLOCKED') msg = t.patronBlocked;

        setErrorMessage(msg);
        announce(msg);
        speak(msg, lang);
      }
    } catch (err) {
      playErrorSound();
      setErrorMessage(t.networkError);
      announce(t.networkError);
    }
  };

  // End Patron Session & wipe memory clean
  const handleEndSession = async (isTimeout = false) => {
    if (sessionToken) {
      try {
        await api.endSession({ sessionToken });
      } catch (err) {
        console.warn('Session end API error:', err);
      }
    }
    // Wipe all sensitive patron data from state
    setSessionToken(null);
    setPatron(null);
    setBorrowedItems([]);
    setReturnedItems([]);
    setRenewedItems([]);
    setIsTimeoutModalOpen(false);
    setIdleSeconds(0);
    setErrorMessage(null);
    setScreen('idle');

    if (isTimeout) {
      announce('Session timed out for privacy.');
      speak('Session ended due to inactivity.', lang);
    } else {
      announce('Session ended.');
      speak('Thank you for visiting NFSU Library.', lang);
    }
  };

  // Renew an individual item
  const handleRenewItem = async (itemBarcode) => {
    if (!sessionToken) return { ok: false };
    const res = await api.renew({ sessionToken, itemBarcode });
    if (res?.ok) {
      setPatron((prev) => {
        if (!prev) return prev;
        const nextItems = prev.chargedItems.map((item) =>
          item.barcode === itemBarcode ? { ...item, dueDate: res.dueDate } : item
        );
        return { ...prev, chargedItems: nextItems };
      });
      setRenewedItems((prev) => [
        { barcode: itemBarcode, title: res.title, dueDate: res.dueDate },
        ...prev.filter((i) => i.barcode !== itemBarcode),
      ]);
      announce(`Renewed item ${itemBarcode}`);
    }
    return res;
  };

  // Renew all charged items
  const handleRenewAll = async () => {
    if (!sessionToken) return;
    const res = await api.renewAll({ sessionToken });
    if (res?.results) {
      setPatron((prev) => {
        if (!prev) return prev;
        const map = new Map(res.results.map((r) => [r.barcode, r.dueDate]));
        const nextItems = prev.chargedItems.map((item) => ({
          ...item,
          dueDate: map.get(item.barcode) || item.dueDate,
        }));
        return { ...prev, chargedItems: nextItems };
      });
      const validRenewals = res.results.filter((r) => r.ok);
      setRenewedItems((prev) => [...validRenewals, ...prev]);
      announce('All items renewed successfully');
    }
  };

  // Checkout API wrapper
  const handleCheckoutApi = async (itemBarcode) => {
    if (!sessionToken) {
      return { ok: false, message: 'No active session' };
    }
    const res = await api.checkout({ sessionToken, itemBarcode });
    if (res?.ok) {
      announce(`Issued ${res.title || itemBarcode}`);
    } else {
      announce(`Issue failed for ${itemBarcode}`);
    }
    return res;
  };

  // Checkin API wrapper
  const handleCheckinApi = async (itemBarcode) => {
    const res = await api.checkin({ itemBarcode });
    if (res?.ok) {
      announce(`Returned ${res.title || itemBarcode}`);
    } else {
      announce(`Return failed for ${itemBarcode}`);
    }
    return res;
  };

  // Global Hardware Keyboard Wedge Scanner & SSE Router
  useScanner((scannedValue, source) => {
    resetIdleTimer();

    if (screen === 'idle') {
      // Idle screen => scan is a Patron MIFARE Card / Barcode
      handleIdentifyPatron(scannedValue, source === 'card' ? 'card' : 'barcode');
    } else if (screen === 'borrow') {
      // Handled via state inside BorrowScreen or trigger function
      window.dispatchEvent(new CustomEvent('kiosk:scan-item', { detail: { barcode: scannedValue } }));
    } else if (screen === 'return') {
      window.dispatchEvent(new CustomEvent('kiosk:scan-return', { detail: { barcode: scannedValue } }));
    } else if (screen === 'home') {
      // If patron scans a book while on home, auto-navigate to borrow and scan it
      setScreen('borrow');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('kiosk:scan-item', { detail: { barcode: scannedValue } }));
      }, 100);
    }
  }, true);

  // Listen to custom dispatch events for BorrowScreen & ReturnScreen
  useEffect(() => {
    const handleItemScan = (e) => {
      const bc = e.detail?.barcode;
      if (bc && screen === 'borrow') {
        const btn = document.querySelector(`[data-barcode-trigger="${bc}"]`);
        if (btn) btn.click();
      }
    };
    window.addEventListener('kiosk:scan-item', handleItemScan);
    return () => window.removeEventListener('kiosk:scan-item', handleItemScan);
  }, [screen]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-scale-base antialiased text-slate-900">
      
      {/* Screen Reader Aria-Live Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {ariaAnnouncement}
      </div>

      {/* Institutional NFSU Header */}
      <Header
        sipStatus={sipStatus}
        lang={lang}
        setLang={setLang}
        contrast={contrast}
        setContrast={setContrast}
        fontScale={fontScale}
        setFontScale={setFontScale}
        currentRoute={screen}
        setRoute={setScreen}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="bg-rose-600 text-white font-bold px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 text-lg">
            <span className="text-2xl">⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-white bg-rose-700 hover:bg-rose-800 px-4 py-1.5 rounded-xl text-sm font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Screen Routing */}
      <main className="flex-1 flex flex-col p-2 sm:p-4">
        {screen === 'idle' && (
          <IdleScreen
            onStartReturn={() => setScreen('return')}
            onOpenKeypad={() => setIsKeypadOpen(true)}
            onStartFaceLogin={() => setScreen('face')}
            onSimulateCard={(id) => handleIdentifyPatron(id, 'card')}
            lang={lang}
            kohaOffline={sipStatus === 'disconnected'}
          />
        )}

        {screen === 'home' && patron && (
          <PatronHomeScreen
            patron={patron}
            onNavigateBorrow={() => setScreen('borrow')}
            onNavigateReturn={() => setScreen('return')}
            onFinishSession={() => {
              if (borrowedItems.length > 0 || returnedItems.length > 0 || renewedItems.length > 0) {
                setScreen('summary');
              } else {
                handleEndSession(false);
              }
            }}
            onRenewItem={handleRenewItem}
            onRenewAll={handleRenewAll}
            lang={lang}
          />
        )}

        {screen === 'borrow' && (
          <BorrowScreen
            sessionToken={sessionToken}
            patron={patron}
            borrowedItems={borrowedItems}
            setBorrowedItems={setBorrowedItems}
            onCheckoutApi={handleCheckoutApi}
            onFinishBorrowing={() => setScreen('summary')}
            onBackToHome={() => setScreen('home')}
            lang={lang}
          />
        )}

        {screen === 'return' && (
          <ReturnScreen
            returnedItems={returnedItems}
            setReturnedItems={setReturnedItems}
            onCheckinApi={handleCheckinApi}
            onFinishReturn={() => {
              if (sessionToken) {
                setScreen('summary');
              } else {
                // Guest return without card -> show receipt / summary
                setScreen('summary');
              }
            }}
            onBack={() => {
              if (sessionToken) setScreen('home');
              else setScreen('idle');
            }}
            lang={lang}
          />
        )}

        {screen === 'summary' && (
          <SummaryScreen
            patron={patron}
            checkouts={borrowedItems.filter((i) => i.status === 'SUCCESS')}
            checkins={returnedItems.filter((i) => i.status === 'SUCCESS')}
            renewals={renewedItems}
            onDone={() => handleEndSession(false)}
            lang={lang}
          />
        )}

        {screen === 'staff' && (
          <StaffDashboard
            onBackToKiosk={() => setScreen('idle')}
            lang={lang}
          />
        )}

        {screen === 'gate' && (
          <GateSimulator
            onBackToKiosk={() => setScreen('idle')}
            lang={lang}
          />
        )}

        {screen === 'face' && (
          <FaceLivenessScreen
            onVerified={() => {
              handleIdentifyPatron(DEMO_CONFIG.patrons[0]?.id || 'NFSU2026001', 'face');
            }}
            onCancel={() => setScreen('idle')}
            lang={lang}
          />
        )}
      </main>

      {/* On-Screen Keypad Modal */}
      <KeypadModal
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onSubmit={(id) => {
          setIsKeypadOpen(false);
          handleIdentifyPatron(id, 'manual');
        }}
        lang={lang}
      />

      {/* Session Inactivity Timeout Warning Modal */}
      <SessionTimeoutModal
        isOpen={isTimeoutModalOpen}
        secondsLeft={IDLE_LIMIT - idleSeconds}
        onStay={resetIdleTimer}
        onLogout={() => handleEndSession(false)}
        lang={lang}
      />
    </div>
  );
}
