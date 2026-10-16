import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, ArrowLeft, Send, Sparkles, Volume2, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { api } from '../api/index.js';
import { playSuccessSound, playErrorSound, playScanBeep } from '../utils/audio.js';

export function GateSimulator({ onBackToKiosk, lang = 'en' }) {
  const [barcode, setBarcode] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [isPassing, setIsPassing] = useState(false);

  const handlePassGate = async (codeToTest) => {
    const code = (codeToTest || barcode).trim().toUpperCase();
    if (!code) return;

    setIsPassing(true);
    setLastResult(null);

    try {
      const res = await api.passGate({ itemBarcode: code });
      setIsPassing(false);
      setLastResult(res);

      if (res.alarm) {
        playErrorSound();
      } else {
        playSuccessSound();
      }
    } catch (err) {
      setIsPassing(false);
      console.error(err);
    }
  };

  return (
    <div className={`flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full p-4 sm:p-6 animate-fade-in transition-colors duration-500 ${
      lastResult?.alarm ? 'bg-rose-950/20' : ''
    }`}>
      
      {/* Top Bar */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
            <Shield className="w-5 h-5 text-nfsu-gold-dark" />
            <span>Library Exit Security • 13.56 MHz RFID AFI / EAS</span>
          </div>
          <h2 className="text-3xl font-extrabold text-nfsu-navy font-serif">
            Security Gate Simulator
          </h2>
        </div>

        <button
          type="button"
          onClick={onBackToKiosk}
          className="min-h-[52px] px-6 py-2.5 bg-nfsu-navy hover:bg-nfsu-navy-light text-white rounded-2xl font-bold flex items-center gap-2 border-2 border-nfsu-gold shadow"
        >
          <ArrowLeft className="w-5 h-5 text-nfsu-gold" />
          <span>Back to Kiosk</span>
        </button>
      </div>

      {/* Full-Screen Alarm / Clear Banner */}
      {lastResult && (
        <div
          className={`rounded-3xl p-6 shadow-2xl border-4 text-center transition-all animate-bounce-once ${
            lastResult.alarm
              ? 'bg-rose-600 text-white border-rose-300 animate-pulse'
              : 'bg-emerald-600 text-white border-emerald-300'
          }`}
          role="alert"
        >
          <div className="flex items-center justify-center gap-3">
            {lastResult.alarm ? (
              <AlertOctagon className="w-16 h-16 animate-spin-slow" />
            ) : (
              <CheckCircle2 className="w-16 h-16" />
            )}
            <div className="text-left">
              <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-wider font-mono">
                {lastResult.alarm ? '🚨 ALARM — ITEM NOT ISSUED' : '✓ CLEAR — LEGITIMATE EXIT'}
              </h3>
              <p className="text-lg font-medium opacity-90 mt-1">
                Item [{lastResult.itemBarcode}]: {lastResult.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Big Gate Graphic & Pedestals */}
      <div className="my-auto py-8 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center gap-8 sm:gap-24 w-full max-w-2xl">
          
          {/* Left Pedestal */}
          <div className="relative flex flex-col items-center">
            <div className={`w-14 sm:w-20 h-80 rounded-t-3xl border-4 shadow-2xl flex flex-col items-center justify-between p-2 transition-all ${
              lastResult?.alarm
                ? 'bg-rose-600 border-rose-300 shadow-rose-500/50'
                : lastResult && !lastResult.alarm
                ? 'bg-emerald-500 border-emerald-300 shadow-emerald-500/50'
                : 'bg-slate-800 border-nfsu-gold'
            }`}>
              <div className="w-4 h-4 rounded-full bg-white/80 animate-ping"></div>
              <div className="text-[10px] font-mono text-white/70 uppercase rotate-90 tracking-widest font-bold">
                ANTENNA A
              </div>
              <div className="w-full h-2 rounded bg-nfsu-gold"></div>
            </div>
            <div className="w-24 sm:w-32 h-6 bg-slate-900 rounded-b-xl border-t-2 border-slate-700"></div>
          </div>

          {/* Central Detection Field Zone */}
          <div className="flex-1 text-center py-8 px-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white/60 backdrop-blur-sm shadow-inner flex flex-col items-center justify-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 transition-colors ${
              lastResult?.alarm
                ? 'bg-rose-100 text-rose-600'
                : lastResult && !lastResult.alarm
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-slate-100 text-slate-500'
            }`}>
              {lastResult?.alarm ? (
                <ShieldAlert className="w-12 h-12 animate-pulse" />
              ) : lastResult && !lastResult.alarm ? (
                <ShieldCheck className="w-12 h-12" />
              ) : (
                <Shield className="w-12 h-12 text-slate-400" />
              )}
            </div>

            <div className="text-lg font-bold text-slate-800 uppercase tracking-widest font-mono">
              Detection Field
            </div>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Pass books through this RFID portal to test EAS security bit status.
            </p>
          </div>

          {/* Right Pedestal */}
          <div className="relative flex flex-col items-center">
            <div className={`w-14 sm:w-20 h-80 rounded-t-3xl border-4 shadow-2xl flex flex-col items-center justify-between p-2 transition-all ${
              lastResult?.alarm
                ? 'bg-rose-600 border-rose-300 shadow-rose-500/50'
                : lastResult && !lastResult.alarm
                ? 'bg-emerald-500 border-emerald-300 shadow-emerald-500/50'
                : 'bg-slate-800 border-nfsu-gold'
            }`}>
              <div className="w-4 h-4 rounded-full bg-white/80 animate-ping"></div>
              <div className="text-[10px] font-mono text-white/70 uppercase rotate-90 tracking-widest font-bold">
                ANTENNA B
              </div>
              <div className="w-full h-2 rounded bg-nfsu-gold"></div>
            </div>
            <div className="w-24 sm:w-32 h-6 bg-slate-900 rounded-b-xl border-t-2 border-slate-700"></div>
          </div>

        </div>
      </div>

      {/* Input Barcode & Interactive Test Controls */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value.toUpperCase())}
            placeholder="Scan or enter book barcode (e.g. BOOK-104)"
            className="flex-1 text-2xl font-mono px-6 py-4 rounded-2xl border-2 border-slate-300 focus:border-nfsu-navy focus:outline-none uppercase"
          />
          <button
            type="button"
            disabled={!barcode.trim() || isPassing}
            onClick={() => handlePassGate()}
            className="min-h-[64px] px-8 bg-nfsu-navy hover:bg-nfsu-navy-light disabled:opacity-50 text-white rounded-2xl text-xl font-extrabold flex items-center justify-center gap-2 border-2 border-nfsu-gold shadow-lg"
          >
            <Send className="w-6 h-6 text-nfsu-gold" />
            <span>Pass Through Gate</span>
          </button>
        </div>

        {/* Demo Walkthrough Story Chips */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-600">Quick Test Story:</span>
            <button
              type="button"
              onClick={() => {
                setBarcode('BOOK-104');
                handlePassGate('BOOK-104');
              }}
              className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl font-mono font-bold border border-rose-300 shadow-sm"
              title="Unissued item — should trigger security alarm"
            >
              🚨 Pass Unissued Item (BOOK-104)
            </button>
            <button
              type="button"
              onClick={() => {
                setBarcode('BOOK-101');
                handlePassGate('BOOK-101');
              }}
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl font-mono font-bold border border-emerald-300 shadow-sm"
              title="Issued item — passes clear"
            >
              ✓ Pass Issued Item (BOOK-101)
            </button>
          </div>

          <span className="text-slate-400 text-xs">
            Simulation matches RFID standard ISO 15693 / ISO 18000-3 Mode 1.
          </span>
        </div>
      </div>

    </div>
  );
}
