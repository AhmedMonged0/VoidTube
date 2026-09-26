import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Loader2, AlertCircle, RefreshCw, MonitorPlay, Sparkles, ChevronDown, Headphones, RotateCcw, RotateCw, Music } from 'lucide-react';
import PlayerControls from './PlayerControls';
import { useApp } from '../../context/AppContext';

export default function VideoPlayer({
  videoId,
  videoData = null,
  isTheater = false,
  onToggleTheater = () => {},
  isMini = false,
  onMinimize = null,
  playerRef = null,
}) {
  const {
    activeInstance,
    playbackSpeed,
    setPlaybackSpeed,
    isLoop,
    toggleLoop,
    sleepTimer,
    startSleepTimer,
    cancelSleepTimer,
    showToast
  } = useApp();

  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hideControlsTimerRef = useRef(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [centerIcon, setCenterIcon] = useState(null); // 'play' | 'pause'
  const [skipRipple, setSkipRipple] = useState(null); // { side: 'left' | 'right', text: '-10s' | '+10s' }
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  // Stream engine: direct vs embed fallback
  const [useEmbed, setUseEmbed] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [streamError, setStreamError] = useState(false);

  // Extract available formats
  const formatStreams = videoData?.formatStreams || [];

  // Listen to sleep timer event
  useEffect(() => {
    const handleSleepTimerTrigger = () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };
    window.addEventListener('voidtube-sleep-timer-trigger', handleSleepTimerTrigger);
    return () => window.removeEventListener('voidtube-sleep-timer-trigger', handleSleepTimerTrigger);
  }, []);

  // Initialize best format stream (prefer blob, downloaded url, or 720p/360p MP4)
  useEffect(() => {
    if (videoData?.blob) {
      const blobUrl = URL.createObjectURL(videoData.blob);
      setSelectedFormat({ url: blobUrl, resolution: videoData.quality || 'Offline', container: 'mp4' });
      setStreamError(false);
      setUseEmbed(false);

      return () => {
        URL.revokeObjectURL(blobUrl);
      };
    } else if (videoData?.url) {
      setSelectedFormat({ url: videoData.url, resolution: videoData.quality || '720p HD', container: 'mp4' });
      setStreamError(false);
      setUseEmbed(false);
    } else if (formatStreams.length > 0) {
      const preferred = formatStreams.find(f => f.resolution === '720p' && f.container === 'mp4')
        || formatStreams.find(f => f.resolution === '360p' && f.container === 'mp4')
        || formatStreams[0];
      setSelectedFormat(preferred);
      setStreamError(false);
    } else {
      setUseEmbed(true);
    }
  }, [videoData, formatStreams]);

  // Video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Apply speed and loop
    video.playbackRate = playbackSpeed;
    video.loop = isLoop;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || videoData?.lengthSeconds || 0);
      setBuffering(false);
      video.playbackRate = playbackSpeed;
      video.loop = isLoop;
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);
    const handleError = () => {
      console.warn('[VoidTube Player] Direct stream error, fallback to embed.');
      setStreamError(true);
      if (!videoData?.blob && !videoData?.url) {
        setUseEmbed(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
    };
  }, [selectedFormat, videoData, playbackSpeed, isLoop]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (useEmbed) return;
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setCenterIcon('play');
    } else {
      video.pause();
      setCenterIcon('pause');
    }
    setTimeout(() => setCenterIcon(null), 500);
  }, [useEmbed]);

  // Handle Seek
  const handleSeek = useCallback((time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Handle Skip with visual ripple
  const handleSkip = useCallback((seconds) => {
    if (videoRef.current) {
      const next = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = next;
      setCurrentTime(next);

      setSkipRipple({
        side: seconds > 0 ? 'right' : 'left',
        text: seconds > 0 ? `+${seconds}s` : `${seconds}s`
      });
      setTimeout(() => setSkipRipple(null), 600);
    }
  }, [duration]);

  // Handle Volume
  const handleVolumeChange = useCallback((newVol) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
    }
  }, []);

  // Handle Mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const nextMute = !isMuted;
      videoRef.current.muted = nextMute;
      setIsMuted(nextMute);
    }
  }, [isMuted]);

  // Handle Picture-in-Picture
  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP error:', err);
      showToast('تعذر فتح النافذة العائمة للنظام على هذا المتصفح', 'info');
    }
  }, [showToast]);

  // Handle Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Handle speed change
  const handleSelectPlaybackSpeed = useCallback((speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    showToast(`سرعة التشغيل: ${speed}x`, 'info');
  }, [setPlaybackSpeed, showToast]);

  // Sync fullscreen change event
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Inactivity hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Double click / tap on sides to seek
  const handleDoubleTap = (e) => {
    if (isMini || useEmbed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width * 0.35) {
      handleSkip(-10);
    } else if (clickX > rect.width * 0.65) {
      handleSkip(10);
    } else {
      togglePlay();
    }
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-5);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSkip(5);
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 't') {
        e.preventDefault();
        onToggleTheater();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        toggleLoop();
        showToast(!isLoop ? 'تم تفعيل تكرار الفيديو' : 'تم تعطيل التكرار', 'info');
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        togglePiP();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSkip, toggleMute, toggleFullscreen, onToggleTheater, toggleLoop, isLoop, togglePiP, showToast]);

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;

  // Keep playerRef updated for external controls (e.g., Mini Player bar)
  if (playerRef) {
    playerRef.current = {
      togglePlay,
      isPlaying,
      currentTime,
      duration,
      videoElement: videoRef.current,
      seek: handleSeek
    };
  }

  const posterImg = videoData?.thumbnailUrl || (videoData?.videoThumbnails?.[0]?.url) || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative w-full h-full bg-black select-none group/player overflow-hidden ${
        isMini ? 'pointer-events-none' : ''
      }`}
    >
      {/* Minimize Overlay Button */}
      {!isMini && onMinimize && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMinimize();
          }}
          className={`absolute top-3 left-3 z-30 p-2 rounded-2xl bg-black/60 hover:bg-neon-purple text-white border border-white/10 backdrop-blur-md transition-all duration-200 active:scale-90 shadow-xl ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          title="تصغير المشغل للمشاهدة أثناء التصفح (مثل يوتيوب)"
        >
          <ChevronDown size={22} className="hover:translate-y-0.5 transition-transform" />
        </button>
      )}

      {!useEmbed ? (
        /* Engine 1: Native HTML5 Direct Player */
        <div
          className="relative w-full h-full flex items-center justify-center cursor-pointer"
          onDoubleClick={handleDoubleTap}
        >
          {/* HTML5 Video element */}
          <video
            ref={videoRef}
            src={selectedFormat?.url}
            poster={posterImg}
            onClick={!isMini ? togglePlay : undefined}
            playsInline
            className={`w-full h-full object-contain ${isAudioOnly ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* Audio-Only Mode Ambient View */}
          {isAudioOnly && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090e] p-6 text-center z-10 pointer-events-none">
              {/* Glowing animated soundwave disc */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-neon-purple/40 shadow-[0_0_60px_rgba(139,92,246,0.35)] flex items-center justify-center p-3 animate-spin-slow">
                <img
                  src={posterImg}
                  alt={videoData?.title}
                  className="w-full h-full object-cover rounded-full shadow-inner"
                />
                <div className="absolute w-12 h-12 rounded-full bg-black/80 border border-white/20 flex items-center justify-center">
                  <Music size={20} className="text-neon-purple animate-pulse" />
                </div>
              </div>
              <div className="mt-5 max-w-md">
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5 mb-2">
                  <Headphones size={13} />
                  وضع الصوت فائق التوفير (Audio-Only)
                </span>
                <h3 className="text-white font-bold text-sm line-clamp-1">{videoData?.title || 'مقطع صوتي'}</h3>
                <p className="text-void-400 text-xs mt-1">{videoData?.author || 'قناة يوتيوب'}</p>
              </div>
            </div>
          )}

          {/* Buffering Indicator */}
          {!isMini && buffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none z-20">
              <Loader2 size={46} className="text-neon-purple animate-spin" />
            </div>
          )}

          {/* Skip Ripple Feedback Indicator */}
          {skipRipple && (
            <div
              className={`absolute top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none z-20 animate-fade-in ${
                skipRipple.side === 'left' ? 'left-0 bg-white/5 rounded-r-full' : 'right-0 bg-white/5 rounded-l-full'
              }`}
            >
              <div className="flex flex-col items-center gap-1 text-white bg-black/70 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md">
                {skipRipple.side === 'left' ? <RotateCcw size={26} /> : <RotateCw size={26} />}
                <span className="text-xs font-bold font-mono">{skipRipple.text}</span>
              </div>
            </div>
          )}

          {/* Play/Pause Center Flash Animation */}
          {!isMini && centerIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="w-16 h-16 rounded-2xl bg-black/75 backdrop-blur-md flex items-center justify-center border border-white/20 text-white animate-fade-in scale-110 shadow-2xl">
                {centerIcon === 'play' ? <Play size={28} className="fill-white ml-0.5" /> : <Pause size={28} className="fill-white" />}
              </div>
            </div>
          )}

          {/* Custom Player Controls (Full mode only) */}
          {!isMini && (
            <PlayerControls
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={handleVolumeChange}
              onToggleMute={toggleMute}
              onSkip={handleSkip}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              isTheater={isTheater}
              onToggleTheater={onToggleTheater}
              formats={videoData?.blob ? [selectedFormat] : formatStreams}
              currentFormat={selectedFormat}
              onSelectFormat={(fmt) => {
                if (videoData?.blob) return;
                setSelectedFormat(fmt);
                if (videoRef.current) {
                  const prevTime = videoRef.current.currentTime;
                  videoRef.current.src = fmt.url;
                  videoRef.current.currentTime = prevTime;
                  videoRef.current.play().catch(() => {});
                }
              }}
              showControls={showControls}
              isDirectStream={true}
              onToggleEngine={() => { if (!videoData?.blob) setUseEmbed(true); }}
              playbackSpeed={playbackSpeed}
              onSelectPlaybackSpeed={handleSelectPlaybackSpeed}
              isLoop={isLoop}
              onToggleLoop={toggleLoop}
              onTogglePiP={togglePiP}
              sleepTimer={sleepTimer}
              onStartSleepTimer={startSleepTimer}
              onCancelSleepTimer={cancelSleepTimer}
              isAudioOnly={isAudioOnly}
              onToggleAudioOnly={() => setIsAudioOnly(prev => !prev)}
            />
          )}
        </div>
      ) : (
        /* Engine 2: Distraction-free Embed Player */
        <div className="relative w-full h-full bg-black">
          <iframe
            src={embedUrl}
            title={videoData?.title || 'VoidTube Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0 pointer-events-auto"
          />

          {/* Direct Stream Retry Badge in Embed Mode */}
          {formatStreams.length > 0 && !isMini && (
            <button
              onClick={() => {
                setUseEmbed(false);
                setStreamError(false);
              }}
              className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/85 hover:bg-neon-purple text-white text-[11px] font-bold border border-white/10 backdrop-blur-md transition-all shadow-lg active:scale-95"
              title="العودة للمشغل المباشر Direct HTML5"
            >
              <RefreshCw size={13} />
              التبديل للمشغل المباشر
            </button>
          )}
        </div>
      )}
    </div>
  );
}
