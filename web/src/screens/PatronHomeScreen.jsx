import React, { useState } from 'react';
import { BookOpen, AlertCircle, Calendar, RefreshCw, CheckCircle, ArrowRight, CornerDownLeft, LogOut, Info, ShieldAlert } from 'lucide-react';
import { translations } from '../i18n.js';
import { formatSipDate } from '../utils/format.js';
import { playSuccessSound, playErrorSound } from '../utils/audio.js';

export function PatronHomeScreen({
  patron,
  onNavigateBorrow,
  onNavigateReturn,
  onFinishSession,
  onRenewItem,
  onRenewAll,
  lang = 'en',
}) {
  const [renewingBarcode, setRenewingBarcode] = useState(null);
  const [isRenewingAll, setIsRenewingAll] = useState(false);
  const t = translations[lang] || translations.en;

  const handleRenewSingle = async (barcode) => {
    setRenewingBarcode(barcode);
    try {
      const res = await onRenewItem(barcode);
      if (res?.ok) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
    } catch {
      playErrorSound();
    } finally {
      setRenewingBarcode(null);
    }
  };

  const handleRenewAllClick = async () => {
    setIsRenewingAll(true);
    try {
      await onRenewAll();
      playSuccessSound();
    } catch {
      playErrorSound();
    } finally {
      setIsRenewingAll(false);
    }
  };

  const items = patron?.chargedItems || [];

  return (
    <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-4 sm:p-6 animate-fade-in space-y-6">
      
      {/* Top Welcome & Patron Stats Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-slate-200">
          <div>
            <div className="text-sm font-bold text-nfsu-gold-dark uppercase tracking-widest">
              NFSU Library Patron
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-nfsu-navy font-serif">
              {t.welcome} {patron?.displayName}
            </h2>
            <div className="flex items-center gap-2 mt-1 font-mono text-slate-500 font-bold">
              <span>Card ID: {patron?.maskedId}</span>
            </div>
          </div>

          {/* Koha System Messages (AF Screen Messages) */}
          {patron?.messages && patron.messages.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-start gap-3 max-w-md">
              <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-amber-900 text-sm uppercase tracking-wider">{t.kohaNotice}</div>
                <div className="text-amber-800 text-sm mt-0.5 font-medium">{patron.messages.join(' ')}</div>
              </div>
            </div>
          )}
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {/* Borrowed */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-center">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {t.borrowedCount}
            </span>
            <span className="text-4xl font-black text-nfsu-navy font-mono">
              {patron?.chargedCount ?? items.length}
            </span>
          </div>

          {/* Overdue (Highlighted in Red) */}
          <div className={`p-4 rounded-2xl border-2 text-center transition-all ${
            (patron?.overdueCount || 0) > 0
              ? 'bg-rose-50 border-rose-400 text-rose-700 animate-pulse'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            <span className="text-sm font-bold uppercase tracking-wider block mb-1">
              {t.overdueCount}
            </span>
            <span className="text-4xl font-black font-mono">
              {patron?.overdueCount || 0}
            </span>
          </div>

          {/* Holds */}
          <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 text-center">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {t.holdsCount}
            </span>
            <span className="text-4xl font-black text-nfsu-navy font-mono">
              {patron?.holdCount || 0}
            </span>
          </div>

          {/* Fines */}
          <div className={`p-4 rounded-2xl border-2 text-center ${
            patron?.feeAmount && patron.feeAmount !== '₹ 0.00'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span className="text-sm font-bold uppercase tracking-wider block mb-1">
              {t.finesDue}
            </span>
            <span className="text-3xl sm:text-4xl font-black font-mono">
              {patron?.feeAmount || '₹ 0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Currently Issued Items List with Renewals */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-nfsu-gold" />
            <h3 className="text-2xl font-bold font-serif text-nfsu-navy">
              {t.currentLoansTitle} ({items.length})
            </h3>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              disabled={isRenewingAll}
              onClick={handleRenewAllClick}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-nfsu-navy rounded-xl font-bold text-base flex items-center gap-2 border border-slate-300 active:scale-95 transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${isRenewingAll ? 'animate-spin' : ''}`} />
              <span>{isRenewingAll ? t.renewing : t.renewAll}</span>
            </button>
          )}
        </div>

        {/* Items Container */}
        <div className="mt-4 flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium text-lg">
              {t.noLoans}
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.barcode}
                className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/70 hover:bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-xl font-bold text-slate-900 font-serif">
                    {item.title || item.barcode}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm font-medium">
                    <span className="font-mono bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-md font-bold">
                      {item.barcode}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="w-4 h-4 text-nfsu-gold-dark" />
                      <span>{t.dueDate}: <strong className="text-slate-900 font-bold">{formatSipDate(item.dueDate)}</strong></span>
                    </span>
                  </div>
                </div>

                {/* Individual Renew Button */}
                <button
                  type="button"
                  disabled={renewingBarcode === item.barcode || isRenewingAll}
                  onClick={() => handleRenewSingle(item.barcode)}
                  className="w-full sm:w-auto min-h-[52px] px-6 py-2 bg-white hover:bg-nfsu-gold/20 text-nfsu-navy border-2 border-nfsu-navy rounded-xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${renewingBarcode === item.barcode ? 'animate-spin' : ''}`} />
                  <span>{renewingBarcode === item.barcode ? t.renewing : t.renew}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Big Action Navigation Buttons (Min Height 72px) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Borrow Books */}
        <button
          type="button"
          onClick={onNavigateBorrow}
          className="min-h-[76px] px-6 py-4 bg-nfsu-navy hover:bg-nfsu-navy-light text-white rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-98 border-2 border-nfsu-gold"
        >
          <BookOpen className="w-8 h-8 text-nfsu-gold" />
          <span className="text-2xl font-extrabold font-serif">{t.borrowBooksBtn}</span>
          <ArrowRight className="w-6 h-6 text-nfsu-gold ml-auto" />
        </button>

        {/* Return Books */}
        <button
          type="button"
          onClick={onNavigateReturn}
          className="min-h-[76px] px-6 py-4 bg-white hover:bg-slate-50 text-nfsu-navy rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-98 border-3 border-nfsu-navy"
        >
          <CornerDownLeft className="w-8 h-8 text-nfsu-navy" />
          <span className="text-2xl font-extrabold font-serif">{t.returnBooksBtn}</span>
        </button>

        {/* Finish Session */}
        <button
          type="button"
          onClick={onFinishSession}
          className="min-h-[76px] px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-3xl shadow-lg flex items-center justify-center gap-4 transition-all active:scale-98 border border-slate-300"
        >
          <LogOut className="w-8 h-8 text-slate-700" />
          <span className="text-2xl font-extrabold font-serif">{t.finishBtn}</span>
        </button>
      </div>

    </div>
  );
}
