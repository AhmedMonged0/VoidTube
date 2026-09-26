import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import VideoPlayer from '../components/Player/VideoPlayer';
import VideoDetails from '../components/Player/VideoDetails';
import { formatDuration, formatViews, formatTimeAgo, getBestThumbnail } from '../utils/formatters';
import { Play, Sparkles, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';

export default function WatchPage() {
  const { nav, navigateToWatch, showMiniPlayer, navigateToHome } = useApp();
  const videoId = nav.videoId;
  const playerRef = useRef(null);

  const [videoData, setVideoData] = useState(() => nav.videoData || null);
  const [loading, setLoading] = useState(!nav.videoData);
  const [error, setError] = useState(null);
  const [isTheater, setIsTheater] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Minimize: slide into floating mini player
  const handleMinimize = () => {
    showMiniPlayer(videoId, videoData);
    navigateToHome();
  };

  // Intercept browser back button to minimize instead of hard-close
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      showMiniPlayer(videoId, videoData);
      // Let navigation proceed naturally (AppContext popstate will set nav to home/prev)
    };
    window.addEventListener('popstate', handlePopState, { once: true });
    return () => window.removeEventListener('popstate', handlePopState);
  }, [videoId, videoData, showMiniPlayer]);

  // Fetch video details
  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;
    if (!videoData) setLoading(true);
    setError(null);

    api.getVideoDetails(videoId)
      .then((data) => {
        if (isMounted) {
          const merged = nav.videoData ? { ...data, ...nav.videoData } : data;
          setVideoData(merged);
          setLoading(false);
          if (merged?.title) {
            document.title = `${merged.title} — VoidTube`;
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Watch fetch upstream error, using fallback:', err);
          const fallbackData = nav.videoData || {
            videoId,
            title: 'فيديو يوتيوب',
            author: 'قناة يوتيوب',
            lengthSeconds: 0,
            viewCount: 0,
            publishedText: 'متاح الآن'
          };
          setVideoData(prev => prev || fallbackData);
          setLoading(false);
          setError(null);
        }
      });

    return () => {
      isMounted = false;
      document.title = 'VoidTube — Cinematic Distraction-Free Streaming';
    };
  }, [videoId]);

  // Fetch related videos dynamically so they ALWAYS show
  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;
    setRelatedLoading(true);

    const loadRelated = async () => {
      // 1. If videoData already has recommendations, use them
      if (videoData?.recommendedVideos?.length > 0) {
        if (isMounted) {
          setRelatedVideos(videoData.recommendedVideos);
          setRelatedLoading(false);
        }
        return;
      }

      // 2. Otherwise search by author or title
      const query = videoData?.author || nav.videoData?.author || videoData?.title || nav.videoData?.title || 'تريند مصر';
      try {
        const searchResults = await api.searchVideos(query, 'video', 1);
        if (isMounted) {
          const filtered = (searchResults || []).filter(v => (v.videoId || v.id) !== videoId);
          if (filtered.length > 0) {
            setRelatedVideos(filtered);
            setRelatedLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Related search failed, trying explore feed:', err);
      }

      // 3. Fallback to explore feed
      try {
        const fallbackFeed = await api.getExploreFeed();
        if (isMounted) {
          const filtered = (fallbackFeed || []).filter(v => (v.videoId || v.id) !== videoId);
          setRelatedVideos(filtered);
          setRelatedLoading(false);
        }
      } catch (err2) {
        if (isMounted) setRelatedLoading(false);
      }
    };

    loadRelated();

    return () => {
      isMounted = false;
    };
  }, [videoId, videoData?.author, videoData?.title, videoData?.recommendedVideos]);

  const handleRetry = () => {
    if (!videoId) return;
    setLoading(true);
    setError(null);
    api.getVideoDetails(videoId)
      .then((data) => {
        setVideoData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const recommended = videoData?.recommendedVideos || [];

  if (error && !videoData) {
    return (
      <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-neon-crimson mb-4 shadow-neon-crimson">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Video Unavailable</h2>
        <p className="text-sm text-void-400 max-w-md mb-6 leading-relaxed">
          {error}
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-neon-purple hover:bg-purple-600 text-white text-xs font-semibold shadow-neon-purple transition-all"
        >
          <RotateCcw size={14} />
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6 flex flex-col gap-6">
      {/* Main Layout: Theater Mode changes flex direction */}
      <div className={`flex flex-col ${isTheater ? 'w-full' : 'lg:flex-row gap-6'}`}>
        
        {/* Left Column (Video Player + Details) */}
        <div className={`flex flex-col flex-1 ${isTheater ? 'w-full mb-6' : 'min-w-0'}`}>
          {/* Video Player */}
          <VideoPlayer
            videoId={videoId}
            videoData={videoData}
            isTheater={isTheater}
            onToggleTheater={() => setIsTheater(!isTheater)}
            onMinimize={handleMinimize}
            playerRef={playerRef}
          />

          {/* Video Details */}
          {loading ? (
            <div className="mt-4 p-6 rounded-2xl glass-card animate-pulse space-y-4">
              <div className="h-6 bg-void-750 rounded-md w-3/4" />
              <div className="h-4 bg-void-800 rounded-md w-1/3" />
              <div className="h-16 bg-void-850 rounded-xl w-full" />
            </div>
          ) : (
            <VideoDetails videoData={videoData} videoId={videoId} />
          )}
        </div>

        {/* Right Column (Sidebar: Related Videos) */}
        <div className={`shrink-0 ${isTheater ? 'w-full lg:w-full max-w-4xl mx-auto' : 'w-full lg:w-80 xl:w-96'}`}>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-void-200 tracking-wide flex items-center gap-2 px-1">
              <Sparkles size={14} className="text-neon-purple" />
              <span>فيديوهات مقترحة وذات صلة</span>
            </h3>

            {relatedLoading && relatedVideos.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-2 rounded-xl glass-card animate-pulse">
                    <div className="w-32 aspect-video bg-void-750 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-void-700 rounded w-full" />
                      <div className="h-3 bg-void-700 rounded w-2/3" />
                      <div className="h-2.5 bg-void-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : relatedVideos.length === 0 ? (
              <div className="p-4 rounded-xl glass-card text-xs text-void-400 text-center">
                لا توجد فيديوهات مقترحة إضافية حالياً.
              </div>
            ) : (
              <div className={`space-y-2.5 ${isTheater ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 space-y-0' : ''}`}>
                {relatedVideos.slice(0, 15).map((rec, idx) => {
                  const recId = rec.videoId || rec.id;
                  const thumb = getBestThumbnail(rec.videoThumbnails, recId) || `https://i.ytimg.com/vi/${recId}/mqdefault.jpg`;
                  const duration = formatDuration(rec.lengthSeconds);
                  const views = formatViews(rec.viewCount || rec.viewCountText);

                  return (
                    <div
                      key={recId + idx}
                      onClick={() => navigateToWatch(recId, rec)}
                      className="group cursor-pointer flex gap-3 p-2 rounded-xl glass-card transition-all duration-150"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-32 sm:w-36 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
                        <img
                          src={thumb}
                          alt={rec.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                        {rec.lengthSeconds > 0 && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-semibold text-white">
                            {duration}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <h4
                          className="text-xs font-semibold text-void-100 group-hover:text-white line-clamp-2 leading-snug transition-colors"
                          title={rec.title}
                        >
                          {rec.title}
                        </h4>
                        <div className="text-[11px] text-void-400 mt-1">
                          <p className="truncate hover:text-void-200">{rec.author || rec.authorName || 'قناة يوتيوب'}</p>
                          {views && <p className="text-void-500 text-[10px]">{views}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
