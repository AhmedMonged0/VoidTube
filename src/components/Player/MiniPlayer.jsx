import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Maximize2, Play, Pause, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function MiniPlayer() {
  const { miniPlayer, hideMiniPlayer, expandMiniPlayer } = useApp();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ bottom: 80, right: 16 });
  const [visible, setVisible] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [streamUrl, setStreamUrl] = useState(null);
  const [useEmbed, setUseEmbed] = useState(false);

  // Animate in/out
  useEffect(() => {
    if (miniPlayer) {
      setVisible(false);
      const t = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [miniPlayer?.videoId]);

  // Setup stream from videoData
  useEffect(() => {
    if (!miniPlayer) {
      setStreamUrl(null);
      setUseEmbed(false);
      return;
    }
    const vd = miniPlayer.videoData;
    if (!vd) { setUseEmbed(true); return; }

    if (vd.blob) {
      const url = URL.createObjectURL(vd.blob);
      setStreamUrl(url);
      setUseEmbed(false);
      return () => URL.revokeObjectURL(url);
    } else if (vd.url) {
      setStreamUrl(vd.url);
      setUseEmbed(false);
    } else {
      const fs = vd.formatStreams || [];
      const best = fs.find(f => f.resolution === '360p' && f.container === 'mp4')
        || fs.find(f => f.container === 'mp4')
        || fs[0];
      if (best) { setStreamUrl(best.url); setUseEmbed(false); }
      else setUseEmbed(true);
    }
  }, [miniPlayer]);

  // Video element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => setUseEmbed(true);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('error', onError);
    video.play().catch(() => {});
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('error', onError);
    };
  }, [streamUrl]);

  const togglePlay = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  // Drag logic
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return;
    isDragging.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.preventDefault();
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.target.closest('button')) return;
    isDragging.current = true;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }, []);

  useEffect(() => {
    const move = (cx, cy) => {
      if (!isDragging.current || !containerRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const rect = containerRef.current.getBoundingClientRect();
      let l = Math.max(8, Math.min(w - rect.width - 8, cx - dragOffset.current.x));
      let t = Math.max(8, Math.min(h - rect.height - 8, cy - dragOffset.current.y));
      setPosition({ right: w - l - rect.width, bottom: h - t - rect.height });
    };
    const onMouseMove = (e) => move(e.clientX, e.clientY);
    const onMouseUp = () => { isDragging.current = false; };
    const onTouchMove = (e) => { const t = e.touches[0]; move(t.clientX, t.clientY); };
    const onTouchEnd = () => { isDragging.current = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  if (!miniPlayer) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${miniPlayer.videoId}?autoplay=1&rel=0&modestbranding=1`;
  const title = miniPlayer.videoData?.title || 'VoidTube Video';
  const author = miniPlayer.videoData?.author || miniPlayer.videoData?.authorName || '';

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => setShowOverlay(true)}
      onMouseLeave={() => setShowOverlay(false)}
      style={{
        position: 'fixed',
        bottom: `${position.bottom}px`,
        right: `${position.right}px`,
        zIndex: 9999,
        width: '300px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.92)',
        transition: 'opacity 0.32s cubic-bezier(.4,0,.2,1), transform 0.32s cubic-bezier(.4,0,.2,1)',
        cursor: isDragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid rgba(139,92,246,0.2)',
          background: '#0d0d12',
          boxShadow: '0 8px 48px rgba(0,0,0,0.8), 0 0 0 1px rgba(139,92,246,0.1)',
        }}
      >
        {/* Video */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
          {!useEmbed ? (
            <video
              ref={videoRef}
              src={streamUrl}
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          )}

          {/* Overlay */}
          <div
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              padding: '8px',
              background: showOverlay
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.65) 100%)'
                : 'transparent',
              transition: 'background 0.2s ease',
            }}
          >
            {/* Top: Expand + Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', opacity: showOverlay ? 1 : 0, transition: 'opacity 0.2s' }}>
              <button
                onClick={(e) => { e.stopPropagation(); expandMiniPlayer(); }}
                style={{
                  padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.75)',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#7c3aed'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
                title="فتح الفيديو بالشاشة الكاملة"
              >
                <Maximize2 size={13} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); hideMiniPlayer(); }}
                style={{
                  padding: '6px', borderRadius: '50%', background: 'rgba(0,0,0,0.75)',
                  border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.75)'}
                title="إغلاق المشغل المصغر"
              >
                <X size={13} />
              </button>
            </div>

            {/* Center: Play/Pause */}
            {!useEmbed && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <button
                  onClick={togglePlay}
                  style={{
                    padding: '10px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)',
                    border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: showOverlay ? 1 : 0, transition: 'opacity 0.2s, background 0.15s',
                    backdropFilter: 'blur(4px)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#7c3aed'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.7)'}
                >
                  {isPlaying
                    ? <Pause size={18} style={{ fill: '#fff' }} />
                    : <Play size={18} style={{ fill: '#fff', marginLeft: '2px' }} />
                  }
                </button>
              </div>
            )}

            <div />
          </div>
        </div>

        {/* Info bar */}
        <div
          onClick={expandMiniPlayer}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          title="انقر للعودة للفيديو"
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: '#e8e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </p>
            {author && (
              <p style={{ margin: 0, fontSize: '10px', color: '#6b6b7a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {author}
              </p>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); expandMiniPlayer(); }}
            style={{
              padding: '4px', borderRadius: '6px', background: 'transparent', border: 'none',
              color: '#8b8ba0', cursor: 'pointer', flexShrink: 0, display: 'flex',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8b8ba0'; e.currentTarget.style.background = 'transparent'; }}
            title="توسيع الفيديو"
          >
            <ChevronUp size={15} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); hideMiniPlayer(); }}
            style={{
              padding: '4px', borderRadius: '6px', background: 'transparent', border: 'none',
              color: '#6b6b7a', cursor: 'pointer', flexShrink: 0, display: 'flex',
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b6b7a'; e.currentTarget.style.background = 'transparent'; }}
            title="إغلاق"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
