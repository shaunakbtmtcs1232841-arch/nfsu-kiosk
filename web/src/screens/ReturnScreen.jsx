import React, { useState } from 'react';
import { CornerDownLeft, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft, ArrowRight, Barcode, Archive, AlertCircle } from 'lucide-react';
import { translations } from '../i18n.js';
import { playSuccessSound, playErrorSound } from '../utils/audio.js';
import { ManualBarcodeModal } from '../components/ManualBarcodeModal.jsx';

export function ReturnScreen({
  returnedItems = [],
  setReturnedItems,
  onCheckinApi,
  onFinishReturn,
  onBack,
  lang = 'en',
}) {
  const [isManualOpen, setIsManualOpen] = useState(false);
  const t = translations[lang] || translations.en;

  const handleScanReturn = async (barcode) => {
    if (!barcode) return;
    const clean = String(barcode).trim().toUpperCase();

    // Prevent duplicate scan while pending
    const isPending = returnedItems.some((i) => i.barcode === clean && i.status === 'PENDING');
    if (isPending) return;

    const newEntry = {
      id: `${clean}_${Date.now()}`,
      barcode: clean,
      status: 'PENDING',
      title: 'Verifying return with Koha…',
      message: t.confirmingKoha,
      sortBin: null,
      alert: null,
      timestamp: new Date(),
    };

    setReturnedItems((prev) => [newEntry, ...prev.filter((i) => i.barcode !== clean)]);

    try {
      const res = await onCheckinApi(clean);

      if (res?.ok) {
        playSuccessSound();
        setReturnedItems((prev) =>
          prev.map((item) =>
            item.id === newEntry.id
              ? {
                  ...item,
                  status: 'SUCCESS',
                  title: res.title || `Item [${clean}]`,
                  message: res.message || t.returnSuccess,
                  sortBin: res.sortBin || 'MAIN-SHELF',
                  alert: res.alert,
                  rfidAction: res.rfid?.action,
                }
              : item
          )
        );
      } else if (res && res.ok === false) {
        playErrorSound();
        setReturnedItems((prev) =>
          prev.map((item) =>
            item.id === newEntry.id
              ? {
                  ...item,
                  status: 'FAILED',
                  title: `Item [${clean}]`,
                  message: res.message || t.returnFailed,
                }
              : item
          )
        );
      } else {
        playErrorSound();
        setReturnedItems((prev) =>
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
      setReturnedItems((prev) =>
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

  const returnedCount = returnedItems.filter((i) => i.status === 'SUCCESS').length;

  return (
    <div className="flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-4 sm:p-6 animate-fade-in space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
            <CornerDownLeft className="w-4 h-4" />
            <span>Koha Material Check-in • Open Access</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-nfsu-navy font-serif">
            {t.returnTitle}
          </h2>
          <p className="text-slate-600 text-lg mt-1 font-medium">
            {t.returnInstruction}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsManualOpen(true)}
          className="min-h-[56px] px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-nfsu-navy rounded-2xl font-bold border-2 border-slate-300 flex items-center gap-2 active:scale-95 transition-all"
        >
          <Barcode className="w-6 h-6 text-nfsu-navy" />
          <span>{t.manualBarcodeBtn}</span>
        </button>
      </div>

      {/* Returned Items Feed */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex-1 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-2xl font-bold font-serif text-nfsu-navy flex items-center gap-2">
            <span>Returned Materials</span>
            <span className="text-base font-sans font-bold bg-blue-700 text-white px-3 py-0.5 rounded-full">
              {returnedCount} Processed
            </span>
          </h3>

          {/* Quick Demo Simulator */}
          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Simulate Return:</span>
            {['BOOK-101', 'BOOK-102', 'BOOK-106'].map((bc) => (
              <button
                key={bc}
                onClick={() => handleScanReturn(bc)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 font-mono font-bold rounded border text-slate-700"
              >
                {bc}
              </button>
            ))}
          </div>
        </div>

        {/* Item Rows */}
        <div className="mt-4 flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1" aria-live="polite">
          {returnedItems.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400">
              <Archive className="w-16 h-16 mb-4 text-slate-300 animate-pulse" />
              <p className="text-xl font-medium text-slate-500 max-w-md">
                {t.emptyReturnList}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                No login required. Place returned book in the designated return bin after scan.
              </p>
            </div>
          ) : (
            returnedItems.map((item) => (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  item.status === 'PENDING'
                    ? 'bg-slate-50 border-slate-300 animate-pulse'
                    : item.status === 'SUCCESS'
                    ? 'bg-blue-50/80 border-blue-400'
                    : item.status === 'FAILED'
                    ? 'bg-rose-50/80 border-rose-400'
                    : 'bg-amber-50/80 border-amber-400'
                }`}
              >
                {/* Status Icon & Book Info */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  {item.status === 'PENDING' && (
                    <div className="w-12 h-12 rounded-full bg-slate-200 text-nfsu-navy flex items-center justify-center shrink-0">
                      <Loader2 className="w-7 h-7 animate-spin" />
                    </div>
                  )}
                  {item.status === 'SUCCESS' && (
                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow">
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
                      <span className="text-slate-700 font-semibold">
                        {item.message}
                      </span>
                    </div>

                    {/* Koha Sort Bin / Alert Message */}
                    {item.status === 'SUCCESS' && item.alert && (
                      <div className="mt-2 text-sm font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>{item.alert}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sort Bin Pill */}
                {item.status === 'SUCCESS' && item.sortBin && (
                  <div className="bg-white px-4 py-2 rounded-xl border border-blue-300 shadow-sm text-right shrink-0">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                      {t.sortBinLabel}
                    </span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      {item.sortBin}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[76px] px-8 bg-white hover:bg-slate-50 text-slate-700 rounded-3xl shadow-lg border-2 border-slate-300 flex items-center justify-center gap-3 active:scale-98 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="text-xl font-bold font-serif">Back</span>
        </button>

        <button
          type="button"
          onClick={onFinishReturn}
          className="flex-1 min-h-[76px] px-8 bg-nfsu-navy hover:bg-nfsu-navy-light text-white rounded-3xl shadow-xl flex items-center justify-center gap-3 active:scale-98 transition-all border-2 border-nfsu-gold"
        >
          <span className="text-2xl font-black font-serif">{t.doneReturning}</span>
          <ArrowRight className="w-7 h-7 text-nfsu-gold" />
        </button>
      </div>

      <ManualBarcodeModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSubmit={(bc) => {
          setIsManualOpen(false);
          handleScanReturn(bc);
        }}
        lang={lang}
      />
    </div>
  );
}
