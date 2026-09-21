import React, { useState } from 'react';
import { Bookmark, Check, Play, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration, formatViews, formatTimeAgo, getBestThumbnail } from '../utils/formatters';

export default function VideoCard({ video, priority = false }) {
  const { navigateToWatch, toggleWatchLater, isWatchLater } = useApp();
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const videoId = video.videoId || video.id;
  const bookmarked = isWatchLater(videoId);

  // High-reliability thumbnail
  const defaultThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const thumbnail = !imgError ? (getBestThumbnail(video.videoThumbnails, videoId) || defaultThumb) : `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

  const duration = formatDuration(video.lengthSeconds);
  const views = formatViews(video.viewCount || video.viewCountText);
  const timeAgo = formatTimeAgo(video.published || video.publishedText);
  const author = video.author || video.authorName || 'قناة';

  const handleClick = (e) => {
    if (e.target.closest('.bookmark-btn')) return;
    navigateToWatch(videoId, video);
  };

  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    toggleWatchLater({
      ...video,
      thumbnail: defaultThumb
    });
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col rounded-2xl bg-[#141419] border border-white/[0.05] hover:border-neon-purple/40 hover:bg-[#171720] transition-all duration-300 overflow-hidden hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8),0_0_20px_-4px_rgba(139,92,246,0.2)] hover:-translate-y-1"
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative w-full aspect-video bg-[#0a0a0e] overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title || 'صورة الفيديو'}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* Hover Center Play Button Badge */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-12 h-12 rounded-full bg-neon-purple/80 backdrop-blur-md flex items-center justify-center shadow-neon-purple transform group-hover:scale-110 transition-transform">
            <Play size={20} className="text-white fill-white ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.lengthSeconds > 0 && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide border border-white/10">
            {duration}
          </div>
        )}

        {/* Quick Save to Watch Later Button */}
        <button
          type="button"
          onClick={handleBookmarkToggle}
          className={`bookmark-btn absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all duration-200 ${
            bookmarked
              ? 'bg-neon-purple text-white shadow-neon-purple opacity-100'
              : 'bg-black/70 text-white/80 hover:text-white hover:bg-black/90 opacity-0 group-hover:opacity-100'
          }`}
          title={bookmarked ? 'إزالة من المشاهدة لاحقاً' : 'حفظ للمشاهدة لاحقاً'}
        >
          {bookmarked ? <Check size={14} strokeWidth={2.8} /> : <Bookmark size={14} />}
        </button>
      </div>

      {/* Metadata Section */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-right" dir="auto">
        {/* Title */}
        <h3
          className="text-sm font-semibold text-void-100 group-hover:text-white line-clamp-2 leading-snug transition-colors"
          title={video.title}
        >
          {video.title}
        </h3>

        {/* Channel & Stats */}
        <div className="flex flex-col gap-1 text-xs text-void-400">
          <div className="flex items-center gap-1.5 font-medium text-void-300 group-hover:text-void-200 transition-colors">
            <span className="truncate">{author}</span>
            {video.authorVerified && (
              <CheckCircle2 size={12} className="text-neon-purple shrink-0" />
            )}
          </div>

          <div className="flex items-center gap-2 text-void-500 text-[11px]">
            {views && <span>{views}</span>}
            {views && timeAgo && <span>•</span>}
            {timeAgo && <span>{timeAgo}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
