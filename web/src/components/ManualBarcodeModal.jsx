import React, { useState } from 'react';
import { X, Barcode, ArrowRight } from 'lucide-react';
import { translations } from '../i18n.js';
import { playScanBeep } from '../utils/audio.js';

export function ManualBarcodeModal({ isOpen, onClose, onSubmit, lang = 'en' }) {
  const [barcode, setBarcode] = useState('');
  const t = translations[lang] || translations.en;

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (barcode.trim().length >= 3) {
      playScanBeep();
      onSubmit(barcode.trim().toUpperCase());
      setBarcode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-4 border-nfsu-navy overflow-hidden">
        <div className="bg-nfsu-navy text-white px-6 py-5 flex items-center justify-between border-b-4 border-nfsu-gold">
          <div className="flex items-center space-x-3">
            <Barcode className="w-8 h-8 text-nfsu-gold" />
            <h2 className="text-2xl font-bold font-serif">{t.manualBarcodeBtn}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10">
            <X className="w-8 h-8" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <label className="block text-slate-700 font-semibold mb-2 text-lg">
            Enter Book / Item Barcode:
          </label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.toUpperCase())}
            placeholder="e.g. BOOK-101 or 100234"
            autoFocus
            className="w-full text-2xl font-mono px-4 py-4 rounded-2xl border-2 border-slate-300 focus:border-nfsu-navy focus:outline-none uppercase tracking-wider mb-4"
          />

          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm font-semibold text-slate-500 w-full">Quick Test Barcodes:</span>
            {['BOOK-101', 'BOOK-102', 'BOOK-103', 'BOOK-104'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBarcode(b)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-mono font-bold text-slate-800 border"
              >
                {b}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[64px] bg-white border-2 border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl text-xl font-bold"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={barcode.trim().length < 3}
              className="flex-2 min-h-[64px] px-8 bg-nfsu-gold hover:bg-nfsu-gold-light disabled:opacity-50 text-nfsu-navy rounded-2xl text-xl font-extrabold flex items-center justify-center gap-2"
            >
              <span>{t.proceed}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
