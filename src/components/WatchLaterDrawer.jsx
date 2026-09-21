import React from 'react';
import { X, Trash2, Play, Bookmark, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration, getBestThumbnail } from '../utils/formatters';

export default function WatchLaterDrawer() {
  const {
    watchLater,
    isWatchLaterOpen,
    setIsWatchLaterOpen,
    removeWatchLater,
    clearAllWatchLater,
    navigateToWatch,
    navigateToHome
  } = useApp();

  if (!isWatchLaterOpen) return null;

  const handlePlay = (video) => {
    setIsWatchLaterOpen(false);
    navigateToWatch(video.videoId || video.id, video);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsWatchLaterOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0e0e13] border-l border-white/[0.08] shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                <Bookmark size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Watch Later
                  <span className="px-2 py-0.5 rounded-full bg-void-800 text-xs text-neon-purple border border-white/5">
                    {watchLater.length}
                  </span>
                </h2>
                <p className="text-[11px] text-void-400">Stored locally in your browser</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {watchLater.length > 0 && (
                <button
                  onClick={clearAllWatchLater}
                  className="p-1.5 rounded-lg text-void-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Clear all saved videos"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => setIsWatchLaterOpen(false)}
                className="p-1.5 rounded-lg text-void-400 hover:text-white hover:bg-void-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Video List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {watchLater.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-void-800/80 border border-white/5 flex items-center justify-center text-void-500 mb-3">
                  <Bookmark size={22} />
                </div>
                <h3 className="text-sm font-semibold text-void-200 mb-1">Your playlist is empty</h3>
                <p className="text-xs text-void-400 max-w-xs mb-5">
                  Hover over any video card and click the bookmark icon to save it for later.
                </p>
                <button
                  onClick={() => {
                    setIsWatchLaterOpen(false);
                    navigateToHome();
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-void-800 hover:bg-void-750 text-void-200 hover:text-white text-xs font-medium border border-white/10 transition-all"
                >
                  Explore Trending Videos
                  <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              watchLater.map((video) => {
                const vidId = video.videoId || video.id;
                const thumb = getBestThumbnail(video.videoThumbnails, vidId) || `https://i.ytimg.com/vi/${vidId}/mqdefault.jpg`;
                const duration = formatDuration(video.lengthSeconds);

                return (
                  <div
                    key={vidId}
                    className="group relative flex items-center gap-3 p-2.5 rounded-xl bg-[#141419] hover:bg-[#181822] border border-white/[0.04] hover:border-neon-purple/30 transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => handlePlay(video)}
                      className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 cursor-pointer"
                    >
                      <img
                        src={thumb}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-neon-purple/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play size={12} className="fill-white ml-0.5" />
                        </div>
                      </div>
                      {video.lengthSeconds > 0 && (
                        <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-medium text-white">
                          {duration}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pr-1">
                      <h4
                        onClick={() => handlePlay(video)}
                        className="text-xs font-semibold text-void-100 group-hover:text-white line-clamp-2 leading-snug cursor-pointer mb-1"
                        title={video.title}
                      >
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-void-400 truncate">
                        {video.author}
                      </p>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => removeWatchLater(vidId)}
                      className="p-2 text-void-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Remove from playlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Actions */}
          {watchLater.length > 0 && (
            <div className="p-4 border-t border-white/[0.06] bg-[#0c0c10]">
              <button
                onClick={() => handlePlay(watchLater[0])}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neon-purple hover:bg-purple-600 text-white text-xs font-semibold shadow-neon-purple transition-all"
              >
                <Play size={14} className="fill-white" />
                Play All (Start with First)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
