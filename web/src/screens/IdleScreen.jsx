import React, { useEffect } from 'react';
import { CreditCard, CornerDownLeft, Sparkles, KeyRound, Scan, ShieldCheck, Camera } from 'lucide-react';
import { translations } from '../i18n.js';
import { speak } from '../utils/voice.js';

export function IdleScreen({
  onStartReturn,
  onOpenKeypad,
  onStartFaceLogin,
  onSimulateCard,
  lang = 'en',
  kohaOffline = false,
}) {
  const t = translations[lang] || translations.en;

  useEffect(() => {
    speak(t.tapCardTitle, lang);
  }, [lang]);

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full p-4 sm:p-8 animate-fade-in">
      
      {/* Offline Alert Banner if Koha SIP is down */}
      {kohaOffline && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-center text-rose-800 font-bold mb-4 flex items-center justify-center gap-2 shadow-sm">
          <span>⚠️</span>
          <span>{t.kohaOfflineNotice}</span>
        </div>
      )}

      {/* Main Attract Area */}
      <div className="my-auto text-center flex flex-col items-center">
        
        {/* Animated Card Reader Pad Target */}
        <div 
          onClick={() => onSimulateCard?.('NFSU1001')}
          title="Click to simulate MIFARE card tap (Demo: NFSU1001)"
          className="relative cursor-pointer group mb-8"
        >
          {/* Pulsing NFC Rings */}
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-nfsu-navy/5 border-4 border-nfsu-gold/40 flex items-center justify-center animate-tap-pulse relative transition-transform duration-300 group-hover:scale-105">
            <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-tr from-nfsu-navy to-nfsu-navy-light text-white flex flex-col items-center justify-center shadow-2xl border-4 border-nfsu-gold">
              <CreditCard className="w-20 h-20 text-nfsu-gold mb-2" />
              <div className="flex items-center gap-1.5 text-xs tracking-widest text-nfsu-gold uppercase font-bold font-mono">
                <Scan className="w-4 h-4 animate-spin text-nfsu-gold" />
                <span>MIFARE / RFID</span>
              </div>
            </div>
          </div>
          <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-nfsu-navy text-nfsu-gold px-4 py-1 rounded-full text-xs font-mono font-bold border border-nfsu-gold shadow">
            NFC TAP ZONE
          </span>
        </div>

        {/* Hero Title */}
        <h2 className="text-3xl sm:text-5xl font-extrabold text-nfsu-navy font-serif tracking-tight max-w-3xl mb-4 leading-tight">
          {t.tapCardTitle}
        </h2>
        <p className="text-xl sm:text-2xl text-slate-600 font-medium max-w-2xl">
          {t.tapCardSub}
        </p>

        {/* Fast Demo Shortcuts for evaluators */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          <span className="text-slate-500 font-medium">Quick Demo Tap:</span>
          <button
            type="button"
            onClick={() => onSimulateCard?.('NFSU1001')}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold border border-slate-300 shadow-sm"
          >
            Aarav (Student 1001)
          </button>
          <button
            type="button"
            onClick={() => onSimulateCard?.('NFSU1002')}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold border border-slate-300 shadow-sm"
          >
            Dr. Priya (Faculty 1002)
          </button>
          <button
            type="button"
            onClick={() => onSimulateCard?.('BLOCKED')}
            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-semibold border border-rose-300 shadow-sm"
          >
            Blocked Card
          </button>
        </div>
      </div>

      {/* Primary Action Buttons (Min Height 72px) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        
        {/* Return Books (No Login Needed) */}
        <button
          type="button"
          onClick={onStartReturn}
          className="min-h-[76px] px-6 py-4 bg-white hover:bg-slate-50 active:scale-98 border-3 border-nfsu-navy text-nfsu-navy rounded-3xl shadow-lg flex items-center justify-center gap-4 transition-all hover:shadow-xl"
        >
          <CornerDownLeft className="w-8 h-8 text-nfsu-navy shrink-0" />
          <div className="text-left">
            <div className="text-xl font-extrabold font-serif leading-tight">
              {t.returnBooksNoLogin}
            </div>
          </div>
        </button>

        {/* Enter Card Number (Keypad) */}
        <button
          type="button"
          onClick={onOpenKeypad}
          className="min-h-[76px] px-6 py-4 bg-white hover:bg-slate-50 active:scale-98 border-3 border-nfsu-navy text-nfsu-navy rounded-3xl shadow-lg flex items-center justify-center gap-4 transition-all hover:shadow-xl"
        >
          <KeyRound className="w-8 h-8 text-nfsu-navy shrink-0" />
          <div className="text-left">
            <div className="text-xl font-extrabold font-serif leading-tight">
              {t.enterCardNumber}
            </div>
          </div>
        </button>

        {/* Face Login (AI Liveness) */}
        <button
          type="button"
          onClick={onStartFaceLogin}
          className="min-h-[76px] px-6 py-4 bg-gradient-to-r from-nfsu-gold to-nfsu-gold-light hover:from-nfsu-gold-light hover:to-nfsu-gold active:scale-98 text-nfsu-navy rounded-3xl shadow-lg flex items-center justify-center gap-4 transition-all hover:shadow-xl border-2 border-nfsu-gold-dark"
        >
          <Camera className="w-8 h-8 text-nfsu-navy shrink-0" />
          <div className="text-left">
            <div className="text-xl font-black font-serif leading-tight flex items-center gap-1.5">
              <span>{t.useFaceLogin}</span>
            </div>
            <div className="text-xs font-bold text-nfsu-navy/80 uppercase tracking-wider">
              Liveness Detection
            </div>
          </div>
        </button>

      </div>
    </div>
  );
}
