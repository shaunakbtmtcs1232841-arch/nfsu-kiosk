import React, { useState } from 'react';
import { X, Delete, ArrowRight, CreditCard } from 'lucide-react';
import { translations } from '../i18n.js';
import { playScanBeep } from '../utils/audio.js';
import { DEMO_CONFIG } from '../demoIds.js';

export function KeypadModal({ isOpen, onClose, onSubmit, lang = 'en' }) {
  const [value, setValue] = useState('');
  const t = translations[lang] || translations.en;

  if (!isOpen) return null;

  const handleKey = (ch) => {
    playScanBeep();
    if (value.length < 20) {
      setValue((prev) => prev + ch);
    }
  };

  const handleBackspace = () => {
    playScanBeep();
    setValue((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setValue('');
  };

  const handleConfirm = () => {
    if (value.trim().length >= 3) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border-4 border-nfsu-navy overflow-hidden"
        role="dialog"
        aria-labelledby="keypad-title"
      >
        {/* Modal Header */}
        <div className="bg-nfsu-navy text-white px-6 py-5 flex items-center justify-between border-b-4 border-nfsu-gold">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-8 h-8 text-nfsu-gold" />
            <h2 id="keypad-title" className="text-2xl font-bold font-serif">
              {t.keypadTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Card Number Input Display */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 shadow-inner flex items-center justify-between">
            <div className="text-3xl font-mono font-bold tracking-widest text-nfsu-navy min-h-[44px] flex items-center">
              {value ? value : <span className="text-slate-400 font-sans text-xl">{t.keypadPlaceholder}</span>}
            </div>
            {value && (
              <button
                onClick={handleClear}
                className="text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200"
              >
                {t.clear}
              </button>
            )}
          </div>
          
          {/* Quick NFSU prefix chips from DEMO_CONFIG */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => {
                playScanBeep();
                setValue((prev) => prev ? prev + 'NFSU' : 'NFSU');
              }}
              className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-semibold text-slate-700"
            >
              +NFSU
            </button>
            {DEMO_CONFIG.patrons.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  playScanBeep();
                  setValue(p.id);
                }}
                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-mono font-semibold text-slate-700"
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>

        {/* Touch Keypad Grid */}
        <div className="p-6 grid grid-cols-3 gap-3 bg-white">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'].map((k) => {
            if (k === 'DEL') {
              return (
                <button
                  key={k}
                  type="button"
                  onClick={handleBackspace}
                  className="min-h-[72px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-2xl font-bold flex items-center justify-center border border-slate-200 shadow-sm active:scale-95 transition-transform"
                  aria-label="Backspace"
                >
                  <Delete className="w-8 h-8" />
                </button>
              );
            }
            if (k === 'C') {
              return (
                <button
                  key={k}
                  type="button"
                  onClick={handleClear}
                  className="min-h-[72px] bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-2xl text-2xl font-bold flex items-center justify-center border border-rose-200 shadow-sm active:scale-95 transition-transform"
                >
                  C
                </button>
              );
            }
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleKey(k)}
                className="min-h-[72px] bg-slate-50 hover:bg-slate-100 text-nfsu-navy rounded-2xl text-3xl font-extrabold flex items-center justify-center border-2 border-slate-200 shadow-sm active:scale-95 transition-transform font-mono"
              >
                {k}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-6 bg-slate-100 border-t border-slate-200 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[64px] bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl text-xl font-bold transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            disabled={value.trim().length < 3}
            onClick={handleConfirm}
            className="flex-2 min-h-[64px] px-8 bg-nfsu-gold hover:bg-nfsu-gold-light disabled:opacity-50 disabled:pointer-events-none text-nfsu-navy rounded-2xl text-2xl font-extrabold shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-98"
          >
            <span>{t.proceed}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
