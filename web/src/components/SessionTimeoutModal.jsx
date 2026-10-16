import React from 'react';
import { AlertTriangle, Clock, LogOut, CheckCircle } from 'lucide-react';
import { translations } from '../i18n.js';

export function SessionTimeoutModal({ isOpen, secondsLeft, onStay, onLogout, lang = 'en' }) {
  const t = translations[lang] || translations.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-4 border-amber-500 overflow-hidden text-center p-8"
        role="alertdialog"
        aria-modal="true"
      >
        <div className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-300 animate-pulse">
          <AlertTriangle className="w-14 h-14" />
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          {t.sessionModalTitle}
        </h2>
        <p className="text-lg text-slate-600 mb-6">
          {t.sessionModalDesc}
        </p>

        {/* Big Countdown Number */}
        <div className="inline-flex items-center justify-center bg-amber-50 border-2 border-amber-300 rounded-2xl px-6 py-4 mb-8">
          <Clock className="w-8 h-8 text-amber-600 mr-3 animate-spin" />
          <span className="text-5xl font-mono font-black text-amber-700">
            {secondsLeft}
          </span>
          <span className="ml-3 text-lg font-semibold text-amber-800">
            {t.secondsRemaining}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="button"
            onClick={onStay}
            className="flex-1 min-h-[64px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-transform"
          >
            <CheckCircle className="w-6 h-6" />
            <span>{t.continueSessionBtn}</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 min-h-[64px] bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-2xl text-xl font-bold flex items-center justify-center gap-2"
          >
            <LogOut className="w-6 h-6" />
            <span>{t.logoutNowBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
