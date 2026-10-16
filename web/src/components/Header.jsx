import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Clock, Sun, Moon, Type, Volume2, VolumeX, Maximize2, Minimize2, Shield, LayoutDashboard } from 'lucide-react';
import { formatTime, formatDate } from '../utils/format.js';
import { translations } from '../i18n.js';
import { setVoiceEnabled, isVoiceEnabled, speak } from '../utils/voice.js';

export function Header({
  sipStatus = 'connected',
  lang = 'en',
  setLang,
  contrast = false,
  setContrast,
  fontScale = 1,
  setFontScale,
  currentRoute = 'kiosk',
  setRoute,
}) {
  const [now, setNow] = useState(new Date());
  const [voiceOn, setVoiceOn] = useState(isVoiceEnabled());
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const t = translations[lang] || translations.en;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    setVoiceEnabled(next);
    if (next) {
      speak(t.voiceAssist + ' enabled', lang);
    }
  };

  const cycleFontSize = () => {
    if (fontScale === 1) setFontScale(1.15);
    else if (fontScale === 1.15) setFontScale(1.3);
    else setFontScale(1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <header className="bg-nfsu-navy text-white shadow-xl border-b-4 border-nfsu-gold relative z-30 select-none">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: University Crest & Identity */}
        <div 
          className="flex items-center space-x-4 cursor-pointer"
          onClick={() => setRoute?.('kiosk')}
        >
          <div className="w-16 h-16 rounded-full bg-white p-1 shadow-md border-2 border-nfsu-gold flex items-center justify-center overflow-hidden shrink-0">
            <img
              src="/nfsu-logo.png"
              alt="NFSU Crest"
              className="w-full h-full object-contain"
              onError={(e) => {
                // If png is not present, use the beautiful SVG crest
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/nfsu-logo.svg';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white font-serif flex items-center gap-2">
              <span>{t.appName}</span>
            </h1>
            <p className="text-sm sm:text-base text-nfsu-gold font-medium tracking-wider uppercase">
              {t.subTitle} • Gandhinagar
            </p>
          </div>
        </div>

        {/* Right: Live Clock, SIP Status, Quick Portals & Accessibility */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Live Date/Clock */}
          <div className="hidden md:flex items-center space-x-2 bg-nfsu-navy-dark/70 px-4 py-2 rounded-xl border border-white/10 text-white">
            <Clock className="w-5 h-5 text-nfsu-gold" />
            <div className="text-right">
              <div className="text-sm font-semibold tracking-wider font-mono">{formatTime(now)}</div>
              <div className="text-xs text-slate-300">{formatDate(now)}</div>
            </div>
          </div>

          {/* SIP2 Koha Live Status Pill */}
          <div
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-full font-semibold text-sm border shadow-sm transition-all ${
              sipStatus === 'connected'
                ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/60'
                : 'bg-rose-950/80 text-rose-200 border-rose-500/60 animate-pulse'
            }`}
            title={`Koha SIP2 status: ${sipStatus}`}
          >
            {sipStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400" />
            )}
            <span>{sipStatus === 'connected' ? t.kohaConnected : t.kohaOffline}</span>
          </div>

          {/* Language Selector */}
          <div className="flex bg-nfsu-navy-dark rounded-xl p-1 border border-white/10">
            {[
              { code: 'en', label: 'EN' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'gu', label: 'ગુજરાતી' },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  lang === l.code
                    ? 'bg-nfsu-gold text-nfsu-navy shadow'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Accessibility Controls: Font size, High contrast, Voice, Fullscreen */}
          <div className="flex items-center space-x-1.5 bg-nfsu-navy-dark/90 p-1 rounded-xl border border-white/10">
            {/* Font Size A / A+ / A++ */}
            <button
              type="button"
              onClick={cycleFontSize}
              title={t.textSize}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-sm font-black flex items-center"
            >
              <Type className="w-4 h-4 mr-0.5" />
              <span>{fontScale === 1 ? 'A' : fontScale === 1.15 ? 'A+' : 'A++'}</span>
            </button>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={() => setContrast(!contrast)}
              title={t.highContrast}
              className={`p-2 rounded-lg transition-colors ${
                contrast ? 'bg-nfsu-gold text-nfsu-navy' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {contrast ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Voice Guidance Toggle */}
            <button
              type="button"
              onClick={toggleVoice}
              title={t.voiceAssist}
              className={`p-2 rounded-lg transition-colors ${
                voiceOn ? 'bg-nfsu-gold text-nfsu-navy' : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {voiceOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Fullscreen Kiosk"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>

          {/* Quick Route Switcher for Evaluators / Staff */}
          <div className="hidden lg:flex items-center space-x-1 pl-1">
            <button
              type="button"
              onClick={() => setRoute('staff')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                currentRoute === 'staff'
                  ? 'bg-nfsu-gold text-nfsu-navy font-bold shadow'
                  : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              title="Staff Circulation Console"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Staff</span>
            </button>
            <button
              type="button"
              onClick={() => setRoute('gate')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                currentRoute === 'gate'
                  ? 'bg-amber-400 text-nfsu-navy font-bold shadow'
                  : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
              title="RFID Security Gate Simulator"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Gate Sim</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
