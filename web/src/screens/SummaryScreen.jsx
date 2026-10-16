import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, ArrowRight, LogOut, QrCode } from 'lucide-react';
import { translations } from '../i18n.js';
import { ThermalReceipt } from '../components/ThermalReceipt.jsx';
import { speak } from '../utils/voice.js';

export function SummaryScreen({
  patron,
  checkouts = [],
  checkins = [],
  renewals = [],
  onDone,
  lang = 'en',
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(20);
  const t = translations[lang] || translations.en;

  const totalTxnCount = checkouts.length + checkins.length + renewals.length;

  useEffect(() => {
    speak('Transaction complete. You may print your receipt or scan the QR slip.', lang);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDone();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onDone, lang]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto w-full p-4 sm:p-6 animate-fade-in space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-nfsu-navy font-serif">
          {t.summaryTitle}
        </h2>
        <p className="text-slate-600 text-lg mt-1 font-medium">
          {t.summarySubtitle}
        </p>

        {/* Auto Return Countdown Pill */}
        <div className="inline-block mt-3 bg-slate-100 text-slate-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-slate-300">
          {t.autoReturnMessage.replace('{seconds}', secondsRemaining)}
        </div>
      </div>

      {/* Main Content: Thermal Receipt Slip Preview */}
      <div className="flex-1 overflow-y-auto">
        <ThermalReceipt
          patron={patron}
          checkouts={checkouts}
          checkins={checkins}
          renewals={renewals}
        />
      </div>

      {/* Bottom Action Buttons (Min Height 72px) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Print Receipt Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="min-h-[76px] px-8 bg-nfsu-navy hover:bg-nfsu-navy-light text-white rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-98 border-2 border-nfsu-gold"
        >
          <Printer className="w-8 h-8 text-nfsu-gold" />
          <span className="text-2xl font-black font-serif">{t.printReceiptBtn}</span>
        </button>

        {/* Done / Logout Button */}
        <button
          type="button"
          onClick={onDone}
          className="min-h-[76px] px-8 bg-gradient-to-r from-nfsu-gold to-nfsu-gold-light hover:from-nfsu-gold-light hover:to-nfsu-gold text-nfsu-navy rounded-3xl shadow-xl flex items-center justify-center gap-4 transition-all active:scale-98 border-2 border-nfsu-gold-dark"
        >
          <span className="text-2xl font-black font-serif">{t.doneBtn}</span>
          <ArrowRight className="w-7 h-7" />
        </button>
      </div>

    </div>
  );
}
