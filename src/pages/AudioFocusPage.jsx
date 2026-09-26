import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Clock,
  Gauge,
  Sparkles,
  Headphones,
  Layers,
  Radio,
  Volume2,
  VolumeX,
  Check,
  Disc,
  ListMusic,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration } from '../utils/formatters';

const ATMOSPHERES = [
  { id: 'cybercity', label: 'Cybercity', gradient: 'from-cyan-900/30 via-[#0a0a14] to-purple-950/40', glow: 'rgba(6,182,212,0.3)' },
  { id: 'neural_void', label: 'Neural Void (Selected)', gradient: 'from-purple-950/40 via-[#0a0a0c] to-indigo-950/40', glow: 'rgba(139,92,246,0.35)' },
  { id: 'crimson_rain', label: 'Crimson Rain', gradient: 'from-rose-950/40 via-[#0a0a0c] to-amber-950/30', glow: 'rgba(244,63,94,0.3)' },
];

const DEFAULT_CHAPTERS = [
  { time: '00:00', title: 'Intro', seconds: 0 },
  { time: '12:40', title: 'Setup & Environment', seconds: 760 },
  { time: '24:12', title: 'Core Implementation', seconds: 1452, current: true },
  { time: '45:10', title: 'Q&A & Optimizations', seconds: 2710 },
];

const DEFAULT_TRACK_QUEUE = [
  {
    id: 'track-1',
    title: 'Focusing Deep, Vol. 4',
    artist: 'Coding Void',
    duration: '04:25',
    seconds: 265,
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'track-2',
    title: 'Mastering Pure OLED Aesthetic',
    artist: 'Coding Void',
    duration: '06:12',
    seconds: 372,
    artwork: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'track-3',
    title: 'Synthwave Night Coding Drive',
    artist: 'Cyber Void',
    duration: '05:48',
    seconds: 348,
    artwork: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'track-4',
    title: 'Subtle Lo-Fi Chillbeats',
    artist: 'Void Lounge',
    duration: '03:55',
    seconds: 235,
    artwork: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'
  }
];

export default function AudioFocusPage() {
  const {
    currentAudioTrack,
    playbackSpeed,
    setPlaybackSpeed,
    sleepTimer,
    startSleepTimer,
    cancelSleepTimer,
    showToast
  } = useApp();

  const [activeAtmosphere, setActiveAtmosphere] = useState('neural_void');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(1452); // Starting at chapter 3 (24:12)
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(2);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const activeTrack = DEFAULT_TRACK_QUEUE[activeTrackIndex];
  const totalDuration = activeTrack.seconds;

  // Progress percentage
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  // Auto-play progress simulation
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            // Next track
            setActiveTrackIndex((i) => (i + 1) % DEFAULT_TRACK_QUEUE.length);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, playbackSpeed]);

  const handleSkipTime = (delta) => {
    setCurrentTime((prev) => Math.max(0, Math.min(totalDuration, prev + delta)));
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(ratio * totalDuration);
  };

  const currentAtmo = ATMOSPHERES.find((a) => a.id === activeAtmosphere) || ATMOSPHERES[1];

  return (
    <div className={`w-full min-h-[calc(100vh-140px)] flex flex-col justify-between py-4 sm:py-6 px-2 sm:px-4 rounded-3xl transition-all duration-700 bg-gradient-to-b ${currentAtmo.gradient} border border-white/[0.06] shadow-2xl relative overflow-hidden`}>
      
      {/* Ambient background glow orb */}
      <div
        className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none -z-0 opacity-40 transition-colors duration-1000"
        style={{ backgroundColor: currentAtmo.glow }}
      />

      {/* Main Grid: Left Vinyl Stage (70%) + Right Widgets (30%) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* CENTER STAGE: Vinyl Record + Radial Visualizer (Desktop: 8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center py-6 sm:py-10 text-center">
          
          {/* Vinyl Container with Radial Visualizer */}
          <div className="relative flex items-center justify-center p-8 sm:p-12">
            
            {/* Radial Soundwave Visualizer Bars (Pulsing around the record) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full border border-purple-500/20 relative flex items-center justify-center">
                {/* 36 Radial Wave Bars */}
                {Array.from({ length: 48 }).map((_, i) => {
                  const deg = (360 / 48) * i;
                  const heightFactor = isPlaying ? (Math.sin(i * 0.8 + Date.now() / 300) * 12 + 16) : 6;
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 rounded-full origin-bottom"
                      style={{
                        height: `${Math.max(4, heightFactor)}px`,
                        transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-145px)`,
                        background: i % 3 === 0 ? '#06b6d4' : i % 2 === 0 ? '#8b5cf6' : '#ec4899',
                        opacity: isPlaying ? 0.85 : 0.25,
                        boxShadow: isPlaying ? '0 0 8px currentColor' : 'none',
                        transition: 'height 0.2s ease, opacity 0.3s ease'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Glowing Vinyl Disc (Spins when playing) */}
            <div
              className={`relative w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-[#0d0d12] shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(139,92,246,0.3)] border-4 border-black/80 flex items-center justify-center p-2.5 transition-transform ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{
                backgroundImage: 'repeating-radial-gradient(circle, #15151c, #15151c 2px, #0b0b10 3px, #0b0b10 4px)'
              }}
            >
              {/* Center Album Art Square (Synthwave Retro Artwork) */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <img
                  src={activeTrack.artwork}
                  alt={activeTrack.title}
                  className="w-full h-full object-cover"
                />
                {/* Glossy sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
              </div>

              {/* Center Hole */}
              <div className="absolute w-5 h-5 rounded-full bg-black border-2 border-white/30 shadow-inner" />
            </div>

          </div>

          {/* Track Title and Artist */}
          <div className="mt-4">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-void-400 mt-1 font-medium">
              {activeTrack.artist}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN WIDGETS: Atmosphere, Chapters, Track Queue (Desktop: 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 text-right" dir="rtl">
          
          {/* 1. Ambient Atmosphere Switcher */}
          <div className="rounded-2xl glass-card p-3.5 border border-white/[0.08]">
            <h4 className="text-[11px] font-black text-void-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-neon-purple" />
              الأجواء والمحيط الصوتي (Ambient Atmosphere)
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {ATMOSPHERES.map((atmo) => (
                <button
                  key={atmo.id}
                  onClick={() => {
                    setActiveAtmosphere(atmo.id);
                    showToast(`تم تبديل الأجواء إلى ${atmo.label}`, 'info');
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    activeAtmosphere === atmo.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-white/[0.04] text-void-300 hover:text-white'
                  }`}
                >
                  {atmo.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. CHAPTERS Widget */}
          <div className="rounded-2xl glass-card p-3.5 border border-white/[0.08]">
            <h4 className="text-[11px] font-black text-void-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers size={13} className="text-cyan-400" />
                فصول المقطع (Chapters)
              </span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">LIVE</span>
            </h4>
            <div className="flex flex-col gap-1.5">
              {DEFAULT_CHAPTERS.map((ch, idx) => {
                const isCur = idx === currentChapterIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setCurrentTime(ch.seconds);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isCur
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        : 'hover:bg-white/[0.04] text-void-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold">{ch.time}</span>
                      <span className="text-xs font-semibold text-white/90">— {ch.title}</span>
                    </div>
                    {isCur && (
                      <span className="text-[10px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Current Chapter
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. TRACK QUEUE Widget */}
          <div className="rounded-2xl glass-card p-3.5 border border-white/[0.08]">
            <h4 className="text-[11px] font-black text-void-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ListMusic size={13} className="text-pink-400" />
              قائمة الانتظار (Track Queue)
            </h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto no-scrollbar">
              {DEFAULT_TRACK_QUEUE.map((trk, i) => {
                const isSelected = i === activeTrackIndex;
                return (
                  <div
                    key={trk.id}
                    onClick={() => {
                      setActiveTrackIndex(i);
                      setCurrentTime(0);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neon-purple/20 border border-neon-purple/40 text-white'
                        : 'hover:bg-white/[0.04] text-void-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={trk.artwork}
                        alt={trk.title}
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-white truncate">{trk.title}</span>
                        <span className="text-[10px] text-void-400 truncate">{trk.artist}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-medium text-void-400">{trk.duration}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM GLASSMORPHIC PLAYER CONTROL BAR (Exact match of Screenshot 1) */}
      <div className="relative z-10 mt-6 max-w-3xl w-full mx-auto rounded-3xl bg-[#14141c]/90 backdrop-blur-2xl border border-white/10 p-4 shadow-[0_15px_45px_rgba(0,0,0,0.8)]" dir="ltr">
        
        {/* Controls Row: Prev, Rewind 15s, Play/Pause, Forward 15s, Next | Speed, Sleep Timer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          
          {/* Main Playback Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTrackIndex((i) => (i - 1 + DEFAULT_TRACK_QUEUE.length) % DEFAULT_TRACK_QUEUE.length)}
              className="p-1.5 text-void-400 hover:text-white transition-colors"
              title="التراك السابق"
            >
              <SkipBack size={18} />
            </button>

            {/* 15s Rewind */}
            <button
              onClick={() => handleSkipTime(-15)}
              className="p-1.5 text-void-300 hover:text-white transition-colors flex items-center gap-0.5 text-xs font-bold font-mono"
              title="ترجيع 15 ثانية"
            >
              <RotateCcw size={18} />
              <span className="text-[10px]">15</span>
            </button>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? <Pause size={20} className="fill-black" /> : <Play size={20} className="fill-black ml-0.5" />}
            </button>

            {/* 15s Forward */}
            <button
              onClick={() => handleSkipTime(15)}
              className="p-1.5 text-void-300 hover:text-white transition-colors flex items-center gap-0.5 text-xs font-bold font-mono"
              title="تقديم 15 ثانية"
            >
              <RotateCw size={18} />
              <span className="text-[10px]">15</span>
            </button>

            <button
              onClick={() => setActiveTrackIndex((i) => (i + 1) % DEFAULT_TRACK_QUEUE.length)}
              className="p-1.5 text-void-400 hover:text-white transition-colors"
              title="التراك التالي"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Right Tools: Speed Selector & Sleep Timer Options */}
          <div className="flex items-center gap-2">
            
            {/* Speed Selector (e.g. 1.5x v) */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/10 text-xs font-mono font-bold text-white transition-all flex items-center gap-1 border border-white/5"
              >
                <span>{playbackSpeed}x</span>
                <span className="text-[10px] text-void-400">▾</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-9 left-0 w-28 py-1 rounded-xl bg-[#14141e] border border-white/10 shadow-2xl z-30">
                  {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setPlaybackSpeed(s);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono flex items-center justify-between hover:bg-white/10 ${
                        playbackSpeed === s ? 'text-neon-purple font-bold' : 'text-void-200'
                      }`}
                    >
                      <span>{s}x</span>
                      {playbackSpeed === s && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sleep Timer Preset Buttons (30m, 45m, End of Track) */}
            <div className="flex items-center gap-1 text-[11px] font-bold">
              <span className="text-void-400 hidden sm:inline mr-1 text-[10px]">Sleep Timer:</span>
              
              <button
                onClick={() => startSleepTimer(30, '30 دقيقة')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  sleepTimer?.active && sleepTimer.minutes === 30
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/[0.04] text-void-300 hover:text-white'
                }`}
              >
                30m
              </button>

              <button
                onClick={() => startSleepTimer(45, '45 دقيقة')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  sleepTimer?.active && sleepTimer.minutes === 45
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/[0.04] text-void-300 hover:text-white'
                }`}
              >
                45m
              </button>

              <button
                onClick={() => {
                  startSleepTimer(Math.ceil((totalDuration - currentTime) / 60), 'نهاية المقطع');
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  sleepTimer?.active && sleepTimer.label === 'نهاية المقطع'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/[0.04] text-void-300 hover:text-white'
                }`}
              >
                End of Track ▾
              </button>
            </div>

          </div>

        </div>

        {/* Timeline Scrubber Bar with Pink/Purple Gradient */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-void-300 min-w-10">
            {formatDuration(currentTime)}
          </span>

          <div
            onClick={handleSeek}
            className="flex-1 h-1.5 hover:h-2.5 bg-white/20 rounded-full cursor-pointer relative overflow-hidden transition-all group"
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-purple via-pink-500 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(236,72,153,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-void-400 min-w-10 text-right">
            {formatDuration(totalDuration)}
          </span>
        </div>

      </div>

    </div>
  );
}
