import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Share2,
  Search,
  Loader2,
  X,
  Plus,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { formatDuration, formatViews, getBestThumbnail } from '../utils/formatters';

const ATMOSPHERES = [
  { id: 'cybercity', label: 'Cybercity', gradient: 'from-cyan-900/30 via-[#0a0a14] to-purple-950/40', glow: 'rgba(6,182,212,0.35)' },
  { id: 'neural_void', label: 'Neural Void (Selected)', gradient: 'from-purple-950/40 via-[#0a0a0c] to-indigo-950/40', glow: 'rgba(139,92,246,0.4)' },
  { id: 'crimson_rain', label: 'Crimson Rain', gradient: 'from-rose-950/40 via-[#0a0a0c] to-amber-950/30', glow: 'rgba(244,63,94,0.35)' },
];

const QUICK_SEARCH_CHIPS = [
  { label: '🎙️ بودكاست فنجان', query: 'بودكاست فنجان ثمانية' },
  { label: '📖 قرآن كريم خاشع', query: 'تلاوة خاشعة سورة الكهف' },
  { label: '🎧 Deep Focus Lo-Fi', query: 'lofi hip hop deep focus chill beats' },
  { label: '💻 بودكاست برمجة وتقنية', query: 'بودكاست تقنية وبرمجة' },
  { label: '🌙 تلاوات هادئة للنوم', query: 'تلاوة هادئة مريحة للنوم' }
];

const INITIAL_QUEUE = [
  {
    videoId: 'jfKfPfyJRdk',
    title: 'Lofi Hip Hop Radio — Beats to Relax/Study to',
    author: 'Lofi Girl',
    duration: 3600,
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
  },
  {
    videoId: '5qap5aO4i9A',
    title: 'Lofi Hip Hop Radio — Beats to Sleep/Chill to',
    author: 'Lofi Girl',
    duration: 3600,
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop'
  },
  {
    videoId: 'synthwave_mix',
    title: 'Synthwave Chill / Coding Void Session',
    author: 'Coding Void',
    duration: 1800,
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop'
  }
];

export default function AudioFocusPage() {
  const {
    nav,
    playbackSpeed,
    setPlaybackSpeed,
    sleepTimer,
    startSleepTimer,
    cancelSleepTimer,
    showToast
  } = useApp();

  const audioRef = useRef(null);

  // Active track state
  const [currentTrack, setCurrentTrack] = useState(() => {
    if (nav.audioTrack) return nav.audioTrack;
    return {
      videoId: 'jfKfPfyJRdk',
      title: 'Focusing Deep | Coding Void Session',
      author: 'Coding Void',
      duration: 360,
      thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
    };
  });

  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(360);
  const [audioStreamUrl, setAudioStreamUrl] = useState(null);
  const [loadingStream, setLoadingStream] = useState(false);
  const [useFallbackEmbed, setUseFallbackEmbed] = useState(false);

  // Search & Suggestions state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const searchDebounceRef = useRef(null);

  // Fetch live suggestions on user type in music search
  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    const clean = searchQuery.trim();
    if (!clean) {
      setSuggestions([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const list = await api.getSuggestions(clean);
        setSuggestions(Array.isArray(list) ? list : []);
      } catch (err) {
        setSuggestions([]);
      }
    }, 140);

    return () => clearTimeout(searchDebounceRef.current);
  }, [searchQuery]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Queue state
  const [queue, setQueue] = useState(INITIAL_QUEUE);

  // Atmosphere state
  const [activeAtmosphere, setActiveAtmosphere] = useState('neural_void');
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Load stream for a track
  const loadTrackAudio = useCallback(async (track) => {
    if (!track) return;
    setCurrentTrack(track);
    setLoadingStream(true);
    setCurrentTime(0);

    const vidId = track.videoId || track.id;
    if (!vidId) {
      setLoadingStream(false);
      return;
    }

    try {
      const details = await api.getVideoDetails(vidId);
      if (details) {
        // Extract best audio format: m4a / webm / or formatStreams MP4
        const adaptive = details.adaptiveFormats || [];
        const m4a = adaptive.find(f => f.container === 'm4a' || (f.type && f.type.includes('audio/mp4')));
        const webm = adaptive.find(f => f.type && f.type.includes('audio'));
        const formats = details.formatStreams || [];
        const directMp4 = formats.find(f => f.container === 'mp4') || formats[0];

        const resolvedUrl = m4a?.url || webm?.url || directMp4?.url || null;

        if (resolvedUrl) {
          setAudioStreamUrl(resolvedUrl);
          setUseFallbackEmbed(false);
          setDuration(details.lengthSeconds || track.duration || 360);
          if (audioRef.current) {
            audioRef.current.src = resolvedUrl;
            audioRef.current.playbackRate = playbackSpeed;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        } else {
          // If no direct format streams, enable audio embed fallback
          setUseFallbackEmbed(true);
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.warn('Audio stream fetch failed, switching to background embed:', err);
      setUseFallbackEmbed(true);
      setIsPlaying(true);
    } finally {
      setLoadingStream(false);
    }
  }, [playbackSpeed]);

  // Initial load if nav track passed
  useEffect(() => {
    if (nav.audioTrack) {
      loadTrackAudio(nav.audioTrack);
    }
  }, [nav.audioTrack, loadTrackAudio]);

  // Handle Search Execution
  const handleExecuteSearch = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;
    setIsSearchFocused(false);
    setIsSearching(true);
    setShowSearchResults(true);
    try {
      const results = await api.searchVideos(q, 'video', 1);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (err) {
      console.warn('Audio search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Play a video as audio
  const handleSelectTrackToPlay = (item) => {
    const trackObj = {
      videoId: item.videoId || item.id,
      title: item.title,
      author: item.author,
      duration: item.lengthSeconds || 300,
      thumbnail: getBestThumbnail(item.videoThumbnails, item.videoId || item.id)
    };
    loadTrackAudio(trackObj);
    // Add to queue if not present
    setQueue(prev => {
      if (prev.some(t => (t.videoId || t.id) === (item.videoId || item.id))) return prev;
      return [trackObj, ...prev];
    });
    setShowSearchResults(false);
    showToast(`جاري تشغيل: ${item.title} 🎧`, 'success');
  };

  // HTML5 Audio Event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = playbackSpeed;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentTrack.duration || 360);
      audio.playbackRate = playbackSpeed;
    };
    const handleEnded = () => {
      // Auto-play next in queue
      const currentIndex = queue.findIndex(t => (t.videoId || t.id) === (currentTrack.videoId || currentTrack.id));
      const nextIndex = (currentIndex + 1) % queue.length;
      loadTrackAudio(queue[nextIndex]);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [currentTrack, queue, playbackSpeed, loadTrackAudio]);

  // Sleep timer trigger listener
  useEffect(() => {
    const handleSleepTimerTrigger = () => {
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    };
    window.addEventListener('voidtube-sleep-timer-trigger', handleSleepTimerTrigger);
    return () => window.removeEventListener('voidtube-sleep-timer-trigger', handleSleepTimerTrigger);
  }, []);

  const togglePlay = () => {
    if (useFallbackEmbed) {
      setIsPlaying(!isPlaying);
      return;
    }
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    if (!duration || duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const seekTime = ratio * duration;
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleSkipTime = (delta) => {
    if (!audioRef.current) return;
    const next = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
    audioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const currentAtmo = ATMOSPHERES.find((a) => a.id === activeAtmosphere) || ATMOSPHERES[1];
  const trackArtwork = currentTrack.thumbnail || getBestThumbnail([], currentTrack.videoId) || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop';

  return (
    <div className={`w-full min-h-[calc(100vh-130px)] flex flex-col justify-between py-4 sm:py-6 px-3 sm:px-6 rounded-3xl transition-all duration-700 bg-gradient-to-b ${currentAtmo.gradient} border border-white/[0.08] shadow-2xl relative overflow-hidden text-right`} dir="rtl">
      
      {/* Hidden real HTML5 Audio element */}
      <audio ref={audioRef} playsInline preload="auto" />

      {/* Fallback hidden embed if direct stream blocked */}
      {useFallbackEmbed && isPlaying && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${currentTrack.videoId || currentTrack.id}?autoplay=1&playsinline=1`}
          title="Audio Stream"
          className="hidden"
          allow="autoplay"
        />
      )}

      {/* Ambient background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[550px] rounded-full blur-[150px] pointer-events-none -z-0 opacity-40 transition-colors duration-1000"
        style={{ backgroundColor: currentAtmo.glow }}
      />

      {/* 1. TOP BAR: Live Search Bar & Quick Genre Filters */}
      <div className="relative z-20 flex flex-col gap-2.5 mb-4">
        <div className="flex items-center gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1" ref={searchContainerRef}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleExecuteSearch(); }}
              placeholder="ابحث عن بودكاست، قرآن، موسيقى، أو أي فيديو لتشغيله كصوت فوراً..."
              className="w-full bg-[#121218]/90 backdrop-blur-xl border border-white/10 focus:border-neon-purple rounded-2xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-white placeholder-void-400 focus:outline-none shadow-xl transition-all"
            />
            <Search size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-void-400 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSuggestions([]); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-void-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}

            {/* Live Suggestions Dropdown for Music Search */}
            {isSearchFocused && suggestions.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-[#121218]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.85)] overflow-hidden z-50 animate-fade-in max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                <div className="px-3 py-2 flex items-center justify-between text-[11px] font-bold text-void-400 bg-white/[0.02]">
                  <span className="flex items-center gap-1.5 text-pink-400">
                    <Sparkles size={12} />
                    <span>اقتراحات البحث الصوتي</span>
                  </span>
                  <span className="text-[10px] text-void-500">اختر للتشغيل الفوري</span>
                </div>
                {suggestions.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchQuery(item);
                      handleExecuteSearch(item);
                      setIsSearchFocused(false);
                    }}
                    className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/[0.08] active:bg-pink-500/20 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Search size={14} className="text-void-400 group-hover:text-pink-400 transition-colors shrink-0" />
                      <span className="text-xs sm:text-sm text-white font-medium truncate" dir="auto">{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery(item);
                      }}
                      className="p-1 text-void-500 hover:text-white hover:bg-white/10 rounded-lg shrink-0 transition-all"
                      title="نسخ للبحث"
                    >
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search Trigger Button */}
          <button
            onClick={() => handleExecuteSearch()}
            disabled={isSearching}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-neon-purple to-purple-700 text-white text-xs font-bold shadow-neon-purple hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            <span>بحث صوتي</span>
          </button>
        </div>

        {/* Quick Search Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {QUICK_SEARCH_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(chip.query);
                handleExecuteSearch(chip.query);
              }}
              className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/[0.04] hover:bg-white/[0.1] text-void-300 hover:text-white border border-white/[0.05] transition-all whitespace-nowrap active:scale-95"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SEARCH RESULTS MODAL / DRAWER (if open) */}
      {showSearchResults && (
        <div className="relative z-30 mb-6 rounded-3xl glass-card p-4 border border-neon-purple/30 shadow-2xl animate-fade-in max-h-72 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-3">
            <h3 className="text-xs font-black text-white flex items-center gap-1.5">
              <Headphones size={15} className="text-neon-purple" />
              نتائج البحث الصوتي:
            </h3>
            <button
              onClick={() => setShowSearchResults(false)}
              className="p-1 rounded-lg text-void-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          {isSearching ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <Loader2 size={28} className="text-neon-purple animate-spin mb-2" />
              <span className="text-xs text-void-400">جاري البحث في مكتبة يوتيوب...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-void-400">
              لم نجد نتائج مطابقة، جرب كتابة اسم مختلف
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {searchResults.map((item, idx) => (
                <div
                  key={item.videoId || item.id || idx}
                  onClick={() => handleSelectTrackToPlay(item)}
                  className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/[0.03] hover:bg-neon-purple/15 border border-white/[0.04] hover:border-neon-purple/40 cursor-pointer transition-all group active:scale-[0.98]"
                >
                  <img
                    src={getBestThumbnail(item.videoThumbnails, item.videoId || item.id)}
                    alt={item.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex flex-col truncate flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-neon-purple transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-void-400 truncate">{item.author}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-neon-purple/20 text-neon-purple shrink-0 group-hover:bg-neon-purple group-hover:text-white transition-colors">
                    <Play size={12} className="fill-current" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. MAIN STAGE: Left Vinyl Record + Right Atmosphere & Queue */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto">
        
        {/* CENTER STAGE: Spinning Vinyl with Perfect Circular Label & Tonearm */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center py-4 text-center">
          
          <div className="relative flex items-center justify-center p-6 sm:p-10">
            
            {/* Radial Soundwave Visualizer Bars around Record */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full border border-purple-500/20 relative flex items-center justify-center">
                {Array.from({ length: 48 }).map((_, i) => {
                  const deg = (360 / 48) * i;
                  const heightFactor = isPlaying ? (Math.sin(i * 0.7 + Date.now() / 250) * 14 + 18) : 5;
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 rounded-full origin-bottom"
                      style={{
                        height: `${Math.max(4, heightFactor)}px`,
                        transform: `translate(-50%, -100%) rotate(${deg}deg) translateY(-155px)`,
                        background: i % 3 === 0 ? '#06b6d4' : i % 2 === 0 ? '#8b5cf6' : '#ec4899',
                        opacity: isPlaying ? 0.9 : 0.25,
                        boxShadow: isPlaying ? '0 0 10px currentColor' : 'none',
                        transition: 'height 0.15s ease'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Tonearm (ذراع الفونوغراف) */}
            <div
              className={`absolute top-0 right-4 sm:right-10 w-24 sm:w-32 h-44 sm:h-52 pointer-events-none transition-transform duration-700 ease-out z-20 origin-top-right ${
                isPlaying ? 'rotate-[20deg]' : 'rotate-[0deg]'
              }`}
            >
              <svg viewBox="0 0 100 180" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
                {/* Pivot base */}
                <circle cx="80" cy="20" r="14" fill="#1c1c24" stroke="#8b5cf6" strokeWidth="2" />
                <circle cx="80" cy="20" r="6" fill="#a78bfa" />
                {/* Metallic arm */}
                <path d="M 80 20 L 45 130 L 25 155" fill="none" stroke="#e2e8f0" strokeWidth="3.5" strokeLinecap="round" />
                {/* Cartridge head */}
                <rect x="15" y="150" width="18" height="24" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" transform="rotate(-25 24 162)" />
              </svg>
            </div>

            {/* Glowing Vinyl Disc (Spins continuously when playing) */}
            <div
              onClick={togglePlay}
              className={`relative w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-[#0b0b10] shadow-[0_0_70px_rgba(0,0,0,0.95),0_0_35px_rgba(139,92,246,0.35)] border-4 border-[#14141e] flex items-center justify-center cursor-pointer p-3 transition-transform ${
                isPlaying ? 'animate-spin-slow' : ''
              }`}
              style={{
                backgroundImage: 'repeating-radial-gradient(circle, #13131c, #13131c 3px, #0a0a0f 4px, #0a0a0f 6px)'
              }}
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {/* Circular Vinyl Center Label (Perfect Circular Border Radius) */}
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden shadow-2xl border-4 border-[#0e0e16] ring-2 ring-white/20 p-0.5 bg-[#14141e] flex items-center justify-center">
                <img
                  src={trackArtwork}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover rounded-full"
                />
                {/* Glossy Vinyl reflections */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-black/30 rounded-full pointer-events-none" />
                {/* Central Spindle Hole */}
                <div className="absolute w-5 h-5 rounded-full bg-[#0a0a0c] border-2 border-white/50 shadow-inner" />
              </div>
            </div>

          </div>

          {/* Track Info */}
          <div className="mt-4 max-w-lg">
            {loadingStream && (
              <span className="text-[11px] font-bold text-neon-purple animate-pulse flex items-center justify-center gap-1 mb-1">
                <Loader2 size={12} className="animate-spin" />
                جاري استخراج مسار الصوت بأعلى جودة...
              </span>
            )}
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight line-clamp-2">
              {currentTrack.title}
            </h2>
            <p className="text-xs sm:text-sm text-void-400 mt-1 font-medium">
              {currentTrack.author}
            </p>
          </div>

        </div>

        {/* RIGHT WIDGETS: Atmosphere & Queue */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Atmosphere Switcher */}
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
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
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

          {/* Track Queue */}
          <div className="rounded-2xl glass-card p-3.5 border border-white/[0.08]">
            <h4 className="text-[11px] font-black text-void-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ListMusic size={13} className="text-pink-400" />
                قائمة الانتظار (Track Queue)
              </span>
              <span className="text-[10px] text-neon-purple font-bold font-mono">{queue.length} مقاطع</span>
            </h4>
            
            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto no-scrollbar">
              {queue.map((trk, i) => {
                const isSelected = (trk.videoId || trk.id) === (currentTrack.videoId || currentTrack.id);
                return (
                  <div
                    key={trk.videoId || trk.id || i}
                    onClick={() => handleSelectTrackToPlay(trk)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neon-purple/20 border border-neon-purple/40 text-white shadow-sm'
                        : 'hover:bg-white/[0.04] text-void-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={trk.thumbnail || getBestThumbnail([], trk.videoId)}
                        alt={trk.title}
                        className="w-9 h-9 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-white truncate">{trk.title}</span>
                        <span className="text-[10px] text-void-400 truncate">{trk.author}</span>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                        يعمل الآن
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono font-medium text-void-400 shrink-0">
                        {formatDuration(trk.duration)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 4. BOTTOM GLASSMORPHIC AUDIO BAR (Exact control layout) */}
      <div className="relative z-20 mt-4 max-w-3xl w-full mx-auto rounded-3xl bg-[#14141c]/90 backdrop-blur-2xl border border-white/10 p-4 shadow-[0_15px_45px_rgba(0,0,0,0.8)]" dir="ltr">
        
        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          
          {/* Main Playback Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => {
                const currentIndex = queue.findIndex(t => (t.videoId || t.id) === (currentTrack.videoId || currentTrack.id));
                const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
                loadTrackAudio(queue[prevIndex]);
              }}
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
              onClick={togglePlay}
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
              onClick={() => {
                const currentIndex = queue.findIndex(t => (t.videoId || t.id) === (currentTrack.videoId || currentTrack.id));
                const nextIndex = (currentIndex + 1) % queue.length;
                loadTrackAudio(queue[nextIndex]);
              }}
              className="p-1.5 text-void-400 hover:text-white transition-colors"
              title="التراك التالي"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Right Tools: Speed Selector & Sleep Timer Options */}
          <div className="flex items-center gap-2">
            
            {/* Speed Selector */}
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
                        if (audioRef.current) audioRef.current.playbackRate = s;
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

            {/* Sleep Timer Preset Buttons */}
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
                  startSleepTimer(Math.ceil((duration - currentTime) / 60), 'نهاية المقطع');
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  sleepTimer?.active && sleepTimer.label === 'نهاية المقطع'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-white/[0.04] text-void-300 hover:text-white'
                }`}
              >
                End of Track
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
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <span className="text-[11px] font-mono text-void-400 min-w-10 text-right">
            {formatDuration(duration)}
          </span>
        </div>

      </div>

    </div>
  );
}
