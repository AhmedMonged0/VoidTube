import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Tv,
  Settings,
  MonitorPlay,
  Repeat,
  Repeat1,
  PictureInPicture2,
  Clock,
  Gauge,
  Headphones,
  Check,
  X
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEP_TIMER_OPTIONS = [
  { label: 'إيقاف', minutes: 0 },
  { label: '15 دقيقة', minutes: 15 },
  { label: '30 دقيقة', minutes: 30 },
  { label: '45 دقيقة', minutes: 45 },
  { label: '60 دقيقة', minutes: 60 },
  { label: 'نهاية المقطع', minutes: -1 } // special flag for end of track
];

export default function PlayerControls({
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  onSkip,
  isFullscreen,
  onToggleFullscreen,
  isTheater,
  onToggleTheater,
  formats = [],
  currentFormat = null,
  onSelectFormat,
  showControls = true,
  isDirectStream = true,
  onToggleEngine = null,
  playbackSpeed = 1,
  onSelectPlaybackSpeed = () => {},
  isLoop = false,
  onToggleLoop = () => {},
  onTogglePiP = null,
  sleepTimer = null,
  onStartSleepTimer = () => {},
  onCancelSleepTimer = () => {},
  isAudioOnly = false,
  onToggleAudioOnly = null
}) {
  const [activeMenu, setActiveMenu] = useState(null); // 'main' | 'quality' | 'speed' | 'timer' | null
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);
  const scrubberRef = useRef(null);
  const menuRef = useRef(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };
    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const handleScrubberMouseMove = (e) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPos(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleScrubberMouseLeave = () => {
    setHoverTime(null);
  };

  const handleScrubberClick = (e) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  return (
    <div
      className={`absolute inset-x-0 bottom-0 px-3 sm:px-5 py-3.5 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 pointer-events-auto ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      dir="ltr"
    >
      {/* 1. Scrubber Bar */}
      <div
        ref={scrubberRef}
        onClick={handleScrubberClick}
        onMouseMove={handleScrubberMouseMove}
        onMouseLeave={handleScrubberMouseLeave}
        className="relative group/scrubber h-3.5 flex items-center cursor-pointer mb-2.5"
      >
        {/* Track */}
        <div className="w-full h-1.5 group-hover/scrubber:h-2.5 bg-white/20 rounded-full transition-all relative overflow-hidden backdrop-blur-sm">
          {/* Played progress with neon gradient */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-purple to-pink-500 rounded-full shadow-[0_0_12px_rgba(139,92,246,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Scrubber Thumb */}
        <div
          className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] -translate-x-1/2 scale-0 group-hover/scrubber:scale-100 transition-transform border-2 border-neon-purple"
          style={{ left: `${progressPercent}%` }}
        />

        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute bottom-5 -translate-x-1/2 px-2.5 py-0.5 rounded-lg bg-black/90 border border-white/15 text-[11px] font-mono font-bold text-white pointer-events-none shadow-xl"
            style={{ left: `${hoverPos}%` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}
      </div>

      {/* 2. Controls Bottom Row */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 text-white">
        
        {/* Left: Play/Pause, Skip 10s, Volume, Time */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/10 text-white transition-colors active:scale-95"
            title={isPlaying ? 'إيقاف مؤقت (Space)' : 'تشغيل (Space)'}
          >
            {isPlaying ? <Pause size={21} className="fill-white" /> : <Play size={21} className="fill-white" />}
          </button>

          {/* 10s Rewind */}
          <button
            onClick={() => onSkip(-10)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors hidden sm:block active:scale-95"
            title="ترجيع 10 ثواني (←)"
          >
            <RotateCcw size={18} />
          </button>

          {/* 10s Forward */}
          <button
            onClick={() => onSkip(10)}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors hidden sm:block active:scale-95"
            title="تقديم 10 ثواني (→)"
          >
            <RotateCw size={18} />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1 group/vol">
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title={isMuted ? 'إلغاء الكتم (M)' : 'كتم الصوت (M)'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={19} className="text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 size={19} />
              ) : (
                <Volume2 size={19} />
              )}
            </button>

            {/* Volume Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-14 sm:w-20 h-1 accent-neon-purple opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              title={`الصوت: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Time Display */}
          <div className="text-xs font-mono font-medium text-white/85 tracking-wider ml-1 whitespace-nowrap">
            <span>{formatDuration(currentTime)}</span>
            <span className="mx-1.5 text-white/40">/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right Controls: Loop, PiP, Audio-Only, Speed/Quality Settings, Theater, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          {/* Audio-only toggle (if available) */}
          {onToggleAudioOnly && isDirectStream && (
            <button
              onClick={onToggleAudioOnly}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAudioOnly
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
              }`}
              title={isAudioOnly ? 'العودة لوضع الفيديو' : 'وضع الصوت فقط لتوفير الباقة'}
            >
              <Headphones size={16} className={isAudioOnly ? 'animate-pulse text-emerald-400' : ''} />
              <span className="hidden lg:inline text-[11px]">{isAudioOnly ? 'صوت فقط' : 'مود صوت'}</span>
            </button>
          )}

          {/* Loop / Repeat Button */}
          {isDirectStream && (
            <button
              onClick={onToggleLoop}
              className={`p-1.5 rounded-xl transition-all ${
                isLoop
                  ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
              }`}
              title={isLoop ? 'تكرار الفيديو: مفعّل' : 'تكرار الفيديو: معطّل'}
            >
              {isLoop ? <Repeat1 size={17} /> : <Repeat size={17} />}
            </button>
          )}

          {/* Picture-in-Picture Button */}
          {onTogglePiP && isDirectStream && (
            <button
              onClick={onTogglePiP}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors hidden sm:block"
              title="نافذة عائمة أصلية للنظام (Picture-in-Picture)"
            >
              <PictureInPicture2 size={17} />
            </button>
          )}

          {/* Playback Speed Quick Badge */}
          {isDirectStream && (
            <button
              onClick={() => setActiveMenu(activeMenu === 'speed' ? null : 'speed')}
              className={`px-2 py-1 rounded-xl text-xs font-bold transition-all ${
                playbackSpeed !== 1
                  ? 'bg-neon-purple text-white shadow-neon-purple'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
              }`}
              title="سرعة التشغيل"
            >
              {playbackSpeed}x
            </button>
          )}

          {/* Engine Switch Button (Direct vs Embed) */}
          {onToggleEngine && (
            <button
              onClick={onToggleEngine}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-neon-purple/30 text-[11px] font-semibold text-white/90 hover:text-white transition-all"
              title="التبديل بين المشغل المباشر والمضمن"
            >
              <MonitorPlay size={13} className="text-neon-purple" />
              <span>{isDirectStream ? 'Direct' : 'Embed'}</span>
            </button>
          )}

          {/* Unified Settings Gear (Quality, Speed, Sleep Timer) */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setActiveMenu(activeMenu ? null : 'main')}
              className={`p-1.5 rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1 ${
                activeMenu ? 'bg-white/15 text-neon-purple' : 'text-white/80 hover:text-white'
              }`}
              title="إعدادات المشغل (الجودة، السرعة، مؤقت النوم)"
            >
              <Settings size={18} className={activeMenu ? 'rotate-45 transition-transform' : ''} />
              {currentFormat?.resolution && isDirectStream && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/15 hidden sm:inline">
                  {currentFormat.resolution}
                </span>
              )}
            </button>

            {/* Settings Popover Dropdown */}
            {activeMenu && (
              <div
                className="absolute bottom-11 right-0 w-52 py-2 rounded-2xl bg-[#121218]/95 backdrop-blur-2xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-40 animate-fade-in text-right"
                dir="rtl"
              >
                {/* 1. Main Settings Menu */}
                {activeMenu === 'main' && (
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="px-3 py-1 font-black text-[11px] text-void-400 border-b border-white/[0.06] flex items-center justify-between">
                      <span>إعدادات العرض</span>
                      <X size={14} className="cursor-pointer hover:text-white" onClick={() => setActiveMenu(null)} />
                    </div>

                    {/* Speed row */}
                    {isDirectStream && (
                      <button
                        onClick={() => setActiveMenu('speed')}
                        className="flex items-center justify-between px-3 py-2 text-void-200 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Gauge size={15} className="text-neon-purple" />
                          سرعة التشغيل
                        </span>
                        <span className="text-[11px] font-bold text-neon-purple font-mono">{playbackSpeed}x ›</span>
                      </button>
                    )}

                    {/* Quality row */}
                    {formats.length > 0 && isDirectStream && (
                      <button
                        onClick={() => setActiveMenu('quality')}
                        className="flex items-center justify-between px-3 py-2 text-void-200 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Settings size={15} className="text-neon-purple" />
                          جودة الفيديو
                        </span>
                        <span className="text-[11px] font-bold text-void-300 font-mono">
                          {currentFormat?.resolution || 'Auto'} ›
                        </span>
                      </button>
                    )}

                    {/* Sleep Timer row */}
                    <button
                      onClick={() => setActiveMenu('timer')}
                      className="flex items-center justify-between px-3 py-2 text-void-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Clock size={15} className="text-emerald-400" />
                        مؤقت النوم
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400">
                        {sleepTimer?.active ? sleepTimer.label : 'معطّل ›'}
                      </span>
                    </button>
                  </div>
                )}

                {/* 2. Speed Submenu */}
                {activeMenu === 'speed' && (
                  <div className="flex flex-col text-xs">
                    <button
                      onClick={() => setActiveMenu('main')}
                      className="px-3 py-1.5 font-bold text-[11px] text-neon-purple border-b border-white/[0.06] text-right flex items-center gap-1 hover:bg-white/5"
                    >
                      <span>‹ رجوع</span>
                      <span className="text-void-400 mr-auto">سرعة التشغيل</span>
                    </button>
                    <div className="max-h-56 overflow-y-auto py-1">
                      {PLAYBACK_RATES.map((rate) => (
                        <button
                          key={rate}
                          onClick={() => {
                            onSelectPlaybackSpeed(rate);
                            setActiveMenu(null);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-white/10 ${
                            playbackSpeed === rate ? 'text-neon-purple font-black bg-neon-purple/10' : 'text-void-200'
                          }`}
                        >
                          <span className="font-mono">{rate === 1 ? '1.0x (عادي)' : `${rate}x`}</span>
                          {playbackSpeed === rate && <Check size={14} className="text-neon-purple" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Quality Submenu */}
                {activeMenu === 'quality' && (
                  <div className="flex flex-col text-xs">
                    <button
                      onClick={() => setActiveMenu('main')}
                      className="px-3 py-1.5 font-bold text-[11px] text-neon-purple border-b border-white/[0.06] text-right flex items-center gap-1 hover:bg-white/5"
                    >
                      <span>‹ رجوع</span>
                      <span className="text-void-400 mr-auto">جودة البث</span>
                    </button>
                    <div className="max-h-56 overflow-y-auto py-1">
                      {formats.map((fmt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            onSelectFormat(fmt);
                            setActiveMenu(null);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-white/10 ${
                            currentFormat?.resolution === fmt.resolution ? 'text-neon-purple font-black bg-neon-purple/10' : 'text-void-200'
                          }`}
                        >
                          <span className="font-mono">{fmt.resolution || 'Auto'}</span>
                          <span className="text-[10px] text-void-500 font-mono">{fmt.container}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Sleep Timer Submenu */}
                {activeMenu === 'timer' && (
                  <div className="flex flex-col text-xs">
                    <button
                      onClick={() => setActiveMenu('main')}
                      className="px-3 py-1.5 font-bold text-[11px] text-neon-purple border-b border-white/[0.06] text-right flex items-center gap-1 hover:bg-white/5"
                    >
                      <span>‹ رجوع</span>
                      <span className="text-void-400 mr-auto">مؤقت النوم</span>
                    </button>
                    <div className="py-1">
                      {SLEEP_TIMER_OPTIONS.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (opt.minutes === 0) {
                              onCancelSleepTimer();
                            } else {
                              onStartSleepTimer(opt.minutes, opt.label);
                            }
                            setActiveMenu(null);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-1.5 hover:bg-white/10 ${
                            (opt.minutes === 0 && !sleepTimer?.active) || (sleepTimer?.active && sleepTimer.minutes === opt.minutes)
                              ? 'text-emerald-400 font-black bg-emerald-500/10'
                              : 'text-void-200'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {((opt.minutes === 0 && !sleepTimer?.active) || (sleepTimer?.active && sleepTimer.minutes === opt.minutes)) && (
                            <Check size={14} className="text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Theater Mode Toggle */}
          <button
            onClick={onToggleTheater}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors hidden md:block"
            title={isTheater ? 'العرض الافتراضي (T)' : 'وضع المسرح السينمائي (T)'}
          >
            <Tv size={18} className={isTheater ? 'text-neon-purple' : ''} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={isFullscreen ? 'إلغاء ملء الشاشة (F)' : 'ملء الشاشة (F)'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

        </div>

      </div>
    </div>
  );
}
