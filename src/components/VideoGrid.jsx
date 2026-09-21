import React from 'react';
import VideoCard from './VideoCard';
import SkeletonGrid from './SkeletonLoader';
import { AlertCircle, RotateCcw, VideoOff } from 'lucide-react';

export default function VideoGrid({
  videos = [],
  loading = false,
  error = null,
  onRetry = null,
  emptyMessage = 'No videos found in the void.',
}) {
  if (loading) {
    return <SkeletonGrid count={12} />;
  }

  if (error) {
    return (
      <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center justify-center text-neon-crimson mb-4 shadow-neon-crimson">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Connection Issue</h3>
        <p className="text-sm text-void-400 max-w-md mb-6 leading-relaxed">
          {error || 'Unable to load videos from the Invidious network. The server may be busy or rate-limited.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neon-purple hover:bg-purple-600 text-white text-xs font-semibold shadow-neon-purple transition-all duration-200"
          >
            <RotateCcw size={14} />
            Try Alternative Instance
          </button>
        )}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="w-full py-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-void-800 border border-white/5 flex items-center justify-center text-void-500 mb-4">
          <VideoOff size={26} />
        </div>
        <h3 className="text-base font-bold text-void-200 mb-1">Silence in the Void</h3>
        <p className="text-xs text-void-400 max-w-sm">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {videos.map((video, idx) => (
        <VideoCard
          key={(video.videoId || video.id || '') + idx}
          video={video}
          priority={idx < 4}
        />
      ))}
    </div>
  );
}
