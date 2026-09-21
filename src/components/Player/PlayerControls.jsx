import React, { useState, useRef } from 'react';
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
  MonitorPlay
} from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

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
  onToggleEngine = null
}) {
  const [showSettings, setShowSettings] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPos, setHoverPos] = useState(0);
  const scrubberRef = useRef(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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
      className={`absolute inset-x-0 bottom-0 px-4 py-3 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 pointer-events-auto ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Scrubber Bar */}
      <div
        ref={scrubberRef}
        onClick={handleScrubberClick}
        onMouseMove={handleScrubberMouseMove}
        onMouseLeave={handleScrubberMouseLeave}
        className="relative group/scrubber h-3 flex items-center cursor-pointer mb-2"
      >
        {/* Background Track */}
        <div className="w-full h-1 group-hover/scrubber:h-2 bg-white/20 rounded-full transition-all relative overflow-hidden">
          {/* Played progress */}
          <div
            className="absolute top-0 left-0 h-full bg-neon-purple rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Scrubber Thumb */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-neon-purple -translate-x-1/2 scale-0 group-hover/scrubber:scale-100 transition-transform"
          style={{ left: `${progressPercent}%` }}
        />

        {/* Hover Time Tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute bottom-4 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 border border-white/10 text-[10px] font-mono text-white pointer-events-none"
            style={{ left: `${hoverPos}%` }}
          >
            {formatDuration(hoverTime)}
          </div>
        )}
      </div>

      {/* Controls Bottom Row */}
      <div className="flex items-center justify-between gap-3 text-white">
        
        {/* Left: Play/Pause, Rewind/FastForward, Volume, Time */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause size={20} className="fill-white" /> : <Play size={20} className="fill-white" />}
          </button>

          {/* 10s Rewind */}
          <button
            onClick={() => onSkip(-10)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors hidden sm:block"
            title="Rewind 10s (Left Arrow)"
          >
            <RotateCcw size={17} />
          </button>

          {/* 10s Forward */}
          <button
            onClick={() => onSkip(10)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors hidden sm:block"
            title="Forward 10s (Right Arrow)"
          >
            <RotateCw size={17} />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 group/vol">
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} className="text-red-400" />
              ) : volume < 0.5 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
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
              className="w-16 h-1 accent-neon-purple opacity-75 group-hover/vol:opacity-100 transition-opacity hidden sm:block"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>

          {/* Time Display */}
          <div className="text-xs font-mono text-white/80 tracking-wider ml-1">
            <span>{formatDuration(currentTime)}</span>
            <span className="mx-1 text-white/40">/</span>
            <span>{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Engine Switch, Quality, Theater, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Toggle Engine Button (Direct vs Embed) */}
          {onToggleEngine && (
            <button
              onClick={onToggleEngine}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 hover:bg-neon-purple/30 text-[11px] font-semibold text-white/90 hover:text-white transition-all"
              title="Switch between Direct Stream and Embed mode"
            >
              <MonitorPlay size={13} className="text-neon-purple" />
              <span className="hidden md:inline">{isDirectStream ? 'Direct Mode' : 'Embed Mode'}</span>
            </button>
          )}

          {/* Quality / Resolution Selector */}
          {formats.length > 0 && isDirectStream && (
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors flex items-center gap-1"
                title="Playback Quality"
              >
                <Settings size={17} />
                {currentFormat?.resolution && (
                  <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-white/20">
                    {currentFormat.resolution}
                  </span>
                )}
              </button>

              {showSettings && (
                <div className="absolute bottom-10 right-0 w-36 py-1 rounded-xl bg-[#14141c] border border-white/10 shadow-2xl z-30">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-void-400 border-b border-white/5">
                    Quality
                  </div>
                  {formats.map((fmt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        onSelectFormat(fmt);
                        setShowSettings(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-white/10 ${
                        currentFormat?.resolution === fmt.resolution ? 'text-neon-purple font-bold' : 'text-void-200'
                      }`}
                    >
                      <span>{fmt.resolution || 'Auto'}</span>
                      <span className="text-[10px] text-void-500">{fmt.container}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theater Mode Toggle */}
          <button
            onClick={onToggleTheater}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors hidden md:block"
            title={isTheater ? 'Default view (T)' : 'Theater mode (T)'}
          >
            <Tv size={18} className={isTheater ? 'text-neon-purple' : ''} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
}
