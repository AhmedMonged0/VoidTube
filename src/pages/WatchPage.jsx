import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import VideoPlayer from '../components/Player/VideoPlayer';
import VideoDetails from '../components/Player/VideoDetails';
import { formatDuration, formatViews, formatTimeAgo, getBestThumbnail } from '../utils/formatters';
import { Play, Sparkles, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';

export default function WatchPage() {
  const { nav, navigateToWatch } = useApp();
  const videoId = nav.videoId;

  const [videoData, setVideoData] = useState(() => nav.videoData || null);
  const [loading, setLoading] = useState(!nav.videoData);
  const [error, setError] = useState(null);
  const [isTheater, setIsTheater] = useState(false);

  useEffect(() => {
    if (!videoId) return;

    let isMounted = true;
    if (!videoData) setLoading(true);
    setError(null);

    api.getVideoDetails(videoId)
      .then((data) => {
        if (isMounted) {
          setVideoData(data);
          setLoading(false);
          // Set page title to video title
          if (data?.title) {
            document.title = `${data.title} — VoidTube`;
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
          />

          {/* Video Details */}
          {loading ? (
            <div className="mt-4 p-6 rounded-2xl bg-[#131318] border border-white/5 animate-pulse space-y-4">
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
              Related Videos
            </h3>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-3 p-2 rounded-xl bg-[#141419] border border-white/[0.03] animate-pulse">
                    <div className="w-32 aspect-video bg-void-750 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 bg-void-700 rounded w-full" />
                      <div className="h-3 bg-void-700 rounded w-2/3" />
                      <div className="h-2.5 bg-void-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recommended.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#141419] border border-white/5 text-xs text-void-400 text-center">
                No recommended videos returned for this video.
              </div>
            ) : (
              <div className={`space-y-2.5 ${isTheater ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 space-y-0' : ''}`}>
                {recommended.slice(0, 15).map((rec, idx) => {
                  const recId = rec.videoId || rec.id;
                  const thumb = getBestThumbnail(rec.videoThumbnails, recId) || `https://i.ytimg.com/vi/${recId}/mqdefault.jpg`;
                  const duration = formatDuration(rec.lengthSeconds);
                  const views = formatViews(rec.viewCount || rec.viewCountText);

                  return (
                    <div
                      key={recId + idx}
                      onClick={() => navigateToWatch(recId, rec)}
                      className="group cursor-pointer flex gap-3 p-2 rounded-xl bg-[#141419] hover:bg-[#191924] border border-white/[0.04] hover:border-neon-purple/30 transition-all duration-150"
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
                          <p className="truncate hover:text-void-200">{rec.author}</p>
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
