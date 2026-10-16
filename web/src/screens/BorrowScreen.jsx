import React, { useState } from 'react';
import { Scan, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft, ArrowRight, Barcode, Radio } from 'lucide-react';
import { translations } from '../i18n.js';
import { formatSipDate } from '../utils/format.js';
import { playSuccessSound, playErrorSound, playScanBeep } from '../utils/audio.js';
import { ManualBarcodeModal } from '../components/ManualBarcodeModal.jsx';

export function BorrowScreen({
  sessionToken,
  patron,
  borrowedItems = [],
  setBorrowedItems,
  onCheckoutApi,
  onFinishBorrowing,
  onBackToHome,
  lang = 'en',
}) {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const t = translations[lang] || translations.en;

  // Process checkout transaction for a scanned barcode
  const handleScanItem = async (barcode) => {
    if (!barcode) return;
    const clean = String(barcode).trim().toUpperCase();

    // Prevent duplicate scan while already pending
    const isPending = borrowedItems.some((i) => i.barcode === clean && i.status === 'PENDING');
    if (isPending) {
      console.warn('Barcode already pending checkout:', clean);
      return;
    }

    // Add row immediately in PENDING state
    const newEntry = {
      id: `${clean}_${Date.now()}`,
      barcode: clean,
      status: 'PENDING',
      title: 'Validating barcode…',
      message: t.confirmingKoha,
      dueDate: null,
      timestamp: new Date(),
    };

    setBorrowedItems((prev) => [newEntry, ...prev.filter((i) => i.barcode !== clean)]);

    try {
      const res = await onCheckoutApi(clean);

      if (res?.ok) {
        playSuccessSound();
        setBorrowedItems((prev) =>
          prev.map((item) =>
            item.id === newEntry.id
              ? {
                  ...item,
                  status: 'SUCCESS',
                  title: res.title || `Item [${clean}]`,
                  dueDate: res.dueDate,
                  message: res.message || t.borrowSuccess,
                  rfidAction: res.rfid?.action,
                }
              : item
          )
        );
      } else if (res && res.ok === false) {
        playErrorSound();
        setBorrowedItems((prev) =>
          prev.map((item) =>
            item.id === newEntry.id
              ? {
                  ...item,
                  status: 'FAILED',
                  title: `Item [${clean}]`,
                  message: res.message || t.borrowFailed,
                }
              : item
          )
        );
      } else {
        // Unconfirmed or network error
        playErrorSound();
        setBorrowedItems((prev) =>
          prev.map((item) =>
            item.id === newEntry.id
              ? {
                  ...item,
                  status: 'UNCONFIRMED',
                  title: `Item [${clean}]`,
                  message: t.unconfirmedNotice,
                }
              : item
          )
        );
      }
    } catch (err) {
      playErrorSound();
      setBorrowedItems((prev) =>
        prev.map((item) =>
          item.id === newEntry.id
            ? {
                ...item,
                status: 'UNCONFIRMED',
                title: `Item [${clean}]`,
                message: t.unconfirmedNotice,
              }
            : item
        )
      );
    }
  };

  const successfulCount = borrowedItems.filter((i) => i.status === 'SUCCESS').length;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-4 sm:p-6 animate-fade-in space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-nfsu-gold-dark uppercase tracking-wider">
            <Radio className="w-4 h-4 animate-pulse text-emerald-600" />
            <span>Koha Circulation Checkout • RFID Active</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-nfsu-navy font-serif">
            {t.borrowTitle}
          </h2>
          <p className="text-slate-600 text-lg mt-1 font-medium">
            {t.borrowInstruction}
          </p>
        </div>

        {/* Manual Barcode Input Trigger */}
        <button
          type="button"
          onClick={() => setIsManualOpen(true)}
          className="min-h-[56px] px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-nfsu-navy rounded-2xl font-bold border-2 border-slate-300 flex items-center gap-2 active:scale-95 transition-all"
        >
          <Barcode className="w-6 h-6 text-nfsu-navy" />
          <span>{t.manualBarcodeBtn}</span>
        </button>
      </div>

      {/* Scanned Items Feed */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-2xl font-bold font-serif text-nfsu-navy flex items-center gap-2">
            <span>Scanned Material Feed</span>
            <span className="text-base font-sans font-bold bg-nfsu-navy text-white px-3 py-0.5 rounded-full">
              {successfulCount} Issued
            </span>
          </h3>

          {/* Quick Barcode Simulator for Demo / Evaluators */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Simulate Scan:</span>
            {['BOOK-103', 'BOOK-104', 'BOOK-105', 'BOOK-999'].map((bc) => (
              <button
                key={bc}
                onClick={() => handleScanItem(bc)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 font-mono font-bold rounded border text-slate-700"
              >
                {bc}
              </button>
            ))}
          </div>
        </div>

        {/* Feed List */}
        <div className="mt-4 flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1" aria-live="polite">
          {borrowedItems.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400">
              <Scan className="w-16 h-16 mb-4 text-slate-300 animate-pulse" />
              <p className="text-xl font-medium text-slate-500 max-w-md">
                {t.emptyBorrowList}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                Use your barcode scanner, place on RFID pad, or tap 'Type Barcode Manually'.
              </p>
            </div>
          ) : (
            borrowedItems.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  item.status === 'PENDING'
                    ? 'bg-slate-50 border-slate-300 animate-pulse'
                    : item.status === 'SUCCESS'
                    ? 'bg-emerald-50/80 border-emerald-400'
                    : item.status === 'FAILED'
                    ? 'bg-rose-50/80 border-rose-400'
                    : 'bg-amber-50/80 border-amber-400'
                }`}
              >
                {/* Left: Status Icon + Title + Barcode */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  {item.status === 'PENDING' && (
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-nfsu-navy flex items-center justify-center shrink-0">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                  )}
                  {item.status === 'SUCCESS' && (
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                  )}
                  {item.status === 'FAILED' && (
                    <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow">
                      <XCircle className="w-7 h-7" />
                    </div>
                  )}
                  {item.status === 'UNCONFIRMED' && (
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="text-xl font-bold text-slate-900 font-serif">
                      {item.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm font-medium">
                      <span className="font-mono font-bold bg-white/80 px-2 py-0.5 rounded border border-slate-300">
                        {item.barcode}
                      </span>
                      <span className={`font-semibold ${
                        item.status === 'SUCCESS'
                          ? 'text-emerald-800'
                          : item.status === 'FAILED'
                          ? 'text-rose-800'
                          : item.status === 'UNCONFIRMED'
                          ? 'text-amber-800 font-bold'
                          : 'text-slate-600'
                      }`}>
                        {item.message}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Due Date (if SUCCESS) */}
                {item.status === 'SUCCESS' && item.dueDate && (
                  <div className="bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-sm text-right shrink-0">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                      {t.dueDate}
                    </span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {formatSipDate(item.dueDate)}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation Buttons (Min Height 72px) */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          type="button"
          onClick={onBackToHome}
          className="min-h-[76px] px-8 bg-white hover:bg-slate-50 text-slate-700 rounded-3xl shadow-lg border-2 border-slate-300 flex items-center justify-center gap-3 active:scale-98 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-xl font-bold font-serif">Back to Home</span>
        </button>

        <button
          type="button"
          onClick={onFinishBorrowing}
          className="flex-1 min-h-[76px] px-8 bg-gradient-to-r from-nfsu-gold to-nfsu-gold-light hover:from-nfsu-gold-light hover:to-nfsu-gold text-nfsu-navy rounded-3xl shadow-xl flex items-center justify-center gap-3 active:scale-98 transition-all border-2 border-nfsu-gold-dark"
        >
          <span className="text-2xl font-black font-serif">{t.doneBorrowing}</span>
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

      {/* Manual Barcode Modal */}
      <ManualBarcodeModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSubmit={(bc) => {
          setIsManualOpen(false);
          handleScanItem(bc);
        }}
        lang={lang}
      />
    </div>
  );
}
