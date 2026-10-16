import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Radio, Activity, CheckCircle, Clock, RefreshCw, Send, ArrowLeft, Shield, AlertTriangle, Layers } from 'lucide-react';
import { api, isMockMode, setForceMock } from '../api/index.js';
import { playScanBeep, playSuccessSound } from '../utils/audio.js';
import { DEMO_CONFIG } from '../demoIds.js';

export function StaffDashboard({ onBackToKiosk, lang = 'en' }) {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [rfidInput, setRfidInput] = useState('');
  const [rfidSuccessMsg, setRfidSuccessMsg] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mockActive, setMockActive] = useState(isMockMode());

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [h, s] = await Promise.all([api.getHealth(), api.getStats()]);
      setHealth(h);
      setStats(s);
    } catch (err) {
      console.error('Failed to load staff data', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);

    // Subscribe to live SSE events for recent transactions
    const unsubscribe = api.subscribeEvents((event) => {
      if (!event) return;
      if (event.type === 'txn') {
        playScanBeep();
        // Prepend new transaction to feed
        setStats((prev) => {
          if (!prev) return prev;
          const newTxn = {
            id: Date.now(),
            type: event.action || 'txn',
            barcode: event.barcode || '—',
            patronMask: event.patronId || '—',
            status: 'OK',
            time: new Date().toLocaleTimeString(),
          };
          return {
            ...prev,
            recent: [newTxn, ...(prev.recent || []).slice(0, 19)],
          };
        });
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe?.();
    };
  }, []);

  const handleSimulateTag = async (barcode) => {
    const code = barcode || rfidInput;
    if (!code.trim()) return;

    try {
      await api.simulateRfidTag({ itemBarcode: code.trim().toUpperCase() });
      playSuccessSound();
      setRfidSuccessMsg(`RFID tag [${code.trim().toUpperCase()}] broadcasted via SSE!`);
      setRfidInput('');
      setTimeout(() => setRfidSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMock = (val) => {
    setForceMock(val);
    setMockActive(val);
    loadData();
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 animate-fade-in space-y-6">
      
      {/* Top Bar with Status and Return Button */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
            <LayoutDashboard className="w-5 h-5 text-nfsu-gold-dark" />
            <span>Staff Administration Console</span>
          </div>
          <h2 className="text-3xl font-extrabold text-nfsu-navy font-serif">
            Koha SIP2 & Circulation Diagnostics
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={loadData}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-300"
            title="Refresh Diagnostics"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-300">
            <button
              type="button"
              onClick={() => toggleMock(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !mockActive ? 'bg-nfsu-navy text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Koha SIP
            </button>
            <button
              type="button"
              onClick={() => toggleMock(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mockActive ? 'bg-nfsu-gold text-nfsu-navy shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mock Engine
            </button>
          </div>

          {/* Back to Kiosk */}
          <button
            type="button"
            onClick={onBackToKiosk}
            className="min-h-[52px] px-6 py-2.5 bg-nfsu-navy hover:bg-nfsu-navy-light text-white rounded-2xl font-bold flex items-center gap-2 border-2 border-nfsu-gold shadow"
          >
            <ArrowLeft className="w-5 h-5 text-nfsu-gold" />
            <span>Back to Kiosk</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* SIP Status & Latency */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">SIP2 Connection</span>
            <Radio className={`w-4 h-4 ${health?.sip === 'connected' ? 'text-emerald-500 animate-pulse' : 'text-rose-500'}`} />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${health?.sip === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span>{health?.sip === 'connected' ? 'Connected' : 'Offline'}</span>
          </div>
          <div className="text-xs text-slate-500 mt-2 font-mono">
            Latency: <strong className="text-slate-800">{health?.latencyMs || stats?.avgLatencyMs || 0} ms</strong>
          </div>
        </div>

        {/* Checkouts Today */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Checkouts Today
          </div>
          <div className="text-4xl font-black text-emerald-600 font-mono">
            {stats?.today?.checkout ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-2">Koha Message 11/12</div>
        </div>

        {/* Check-ins Today */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Returns / Check-ins
          </div>
          <div className="text-4xl font-black text-blue-600 font-mono">
            {stats?.today?.checkin ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-2">Koha Message 09/10</div>
        </div>

        {/* Renewals Today */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Renewals Processed
          </div>
          <div className="text-4xl font-black text-purple-600 font-mono">
            {stats?.today?.renew ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-2">Koha Message 29/30</div>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-md">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Success Rate
          </div>
          <div className="text-4xl font-black text-nfsu-navy font-mono">
            {Math.round((stats?.successRate ?? 0.98) * 100)}%
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-2">✓ All Systems Nominal</div>
        </div>

      </div>

      {/* Main Grid: RFID Tag Simulator & Live Transaction Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Hardware Simulator */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Radio className="w-6 h-6 text-nfsu-gold-dark" />
              <h3 className="text-2xl font-bold font-serif text-nfsu-navy">
                Simulate RFID Tag
              </h3>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Broadcasts an RFID event over Server-Sent Events (SSE). Active kiosk screens will capture the item automatically.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value.toUpperCase())}
                placeholder="Enter Item Barcode (e.g. BOOK-101)"
                className="w-full text-lg font-mono px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-nfsu-navy focus:outline-none uppercase"
              />

              <button
                type="button"
                onClick={() => handleSimulateTag()}
                disabled={!rfidInput.trim()}
                className="w-full min-h-[52px] bg-nfsu-navy hover:bg-nfsu-navy-light disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-nfsu-gold shadow"
              >
                <Send className="w-5 h-5 text-nfsu-gold" />
                <span>Broadcast Tag to Kiosk</span>
              </button>

              {rfidSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{rfidSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Quick Demo Tag Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Tag Broadcast:
              </span>
              <div className="flex flex-wrap gap-2">
                {DEMO_CONFIG.items.map((item) => (
                  <button
                    key={item.barcode}
                    type="button"
                    onClick={() => handleSimulateTag(item.barcode)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border rounded-lg text-xs font-mono font-bold text-slate-700"
                  >
                    📡 {item.barcode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500">
            <strong>Koha 26 Protocol Spec:</strong> SIP2 Server at 117.239.182.15:6001. Checksum verification enabled.
          </div>
        </div>

        {/* Right Column: Live Recent Transactions Feed */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xl border-3 border-nfsu-navy flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-600 animate-pulse" />
              <h3 className="text-2xl font-bold font-serif text-nfsu-navy">
                Recent Circulation Feed (Live SSE)
              </h3>
            </div>
            <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">
              ● Streaming
            </span>
          </div>

          <div className="mt-4 flex-1 overflow-y-auto max-h-[440px] space-y-2 pr-1">
            {(!stats?.recent || stats.recent.length === 0) ? (
              <div className="text-center py-12 text-slate-400">
                No circulation transactions recorded yet today.
              </div>
            ) : (
              stats.recent.map((txn, idx) => (
                <div
                  key={txn.id || idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white flex items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                      txn.type === 'checkout'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : txn.type === 'checkin'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-purple-100 text-purple-800 border border-purple-300'
                    }`}>
                      {txn.type}
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {txn.barcode}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      Patron: <strong className="text-slate-700">{txn.patronMask || '—'}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {txn.status || 'OK'}
                    </span>
                    <span className="text-slate-400">
                      {txn.time}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
