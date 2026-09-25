import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Loader2, AlertCircle, RefreshCw, MonitorPlay, Sparkles } from 'lucide-react';
import PlayerControls from './PlayerControls';
import { useApp } from '../../context/AppContext';

export default function VideoPlayer({
  videoId,
  videoData = null,
  isTheater = false,
  onToggleTheater = () => {},
}) {
  const { activeInstance } = useApp();
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

  // Stream engine: direct vs embed fallback
  const [useEmbed, setUseEmbed] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [streamError, setStreamError] = useState(false);

  // Extract available formats
  const formatStreams = videoData?.formatStreams || [];

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
      // Direct downloaded MP4 stream or local URL!
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
      // If no direct format streams available from instance, automatically switch to embed mode
      setUseEmbed(true);
    }
  }, [videoData, formatStreams]);

  // Video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || videoData?.lengthSeconds || 0);
      setBuffering(false);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);
    const handleError = () => {
      console.warn('[VoidTube Player] Direct stream failed or blocked by CORS.');
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
  }, [selectedFormat, videoData]);

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

  // Handle Skip
  const handleSkip = useCallback((seconds) => {
    if (videoRef.current) {
      const next = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = next;
      setCurrentTime(next);
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
      }, 2800);
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSkip, toggleMute, toggleFullscreen, onToggleTheater]);

  // Embed URL for fallback
  // Using privacy-first YouTube nocookie with clean distraction-free parameters or Invidious embed
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/[0.08] select-none group/player"
    >
      {/* Engine 1: Direct HTML5 Video Player */}
      {!useEmbed && selectedFormat?.url ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={selectedFormat.url}
            autoPlay
            playsInline
            onClick={togglePlay}
            className="w-full h-full object-contain cursor-pointer"
          />

          {/* Buffering Indicator */}
          {buffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
              <Loader2 size={44} className="text-neon-purple animate-spin" />
            </div>
          )}

          {/* Play/Pause Center Flash Animation */}
          {centerIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center border border-white/20 text-white animate-fade-in scale-110">
                {centerIcon === 'play' ? <Play size={28} className="fill-white ml-1" /> : <Pause size={28} className="fill-white" />}
              </div>
            </div>
          )}

          {/* Custom Player Controls */}
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
          />
        </div>
      ) : (
        /* Engine 2: Distraction-free Embed Player */
        <div className="relative w-full h-full bg-black">
          <iframe
            src={embedUrl}
            title={videoData?.title || 'VoidTube Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />

          {/* Direct Stream Retry Badge in Embed Mode */}
          {formatStreams.length > 0 && (
            <button
              onClick={() => {
                setUseEmbed(false);
                setStreamError(false);
              }}
              className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 hover:bg-neon-purple text-white text-[11px] font-semibold border border-white/10 backdrop-blur-md transition-all shadow-lg"
              title="Attempt direct HTML5 stream"
            >
              <RefreshCw size={12} />
              Switch to Direct Player
            </button>
          )}
        </div>
      )}
    </div>
  );
}
