import React, { useState } from 'react';
import { Bookmark, Check, Play, CheckCircle2, Download, MoreVertical, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration, formatViews, formatTimeAgo, getBestThumbnail } from '../utils/formatters';

// Generate consistent beautiful gradients for avatars based on channel name
function getAvatarGradient(name = '') {
  const gradients = [
    'from-purple-600 to-indigo-700',
    'from-rose-600 to-amber-600',
    'from-emerald-600 to-teal-700',
    'from-blue-600 to-cyan-600',
    'from-amber-500 to-orange-600',
    'from-fuchsia-600 to-pink-600',
    'from-violet-600 to-purple-800'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function VideoCard({ video, priority = false }) {
  const { navigateToWatch, toggleWatchLater, isWatchLater, triggerBackgroundDownload, isVideoDownloaded, downloadingVideos } = useApp();
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const videoId = video.videoId || video.id;
  const bookmarked = isWatchLater(videoId);
  const downloaded = isVideoDownloaded ? isVideoDownloaded(videoId) : false;

  // High-reliability thumbnail
  const defaultThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const thumbnail = !imgError 
    ? (getBestThumbnail(video.videoThumbnails, videoId) || defaultThumb) 
    : `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

  const duration = formatDuration(video.lengthSeconds);
  const views = formatViews(video.viewCount || video.viewCountText);
  const timeAgo = formatTimeAgo(video.published || video.publishedText);
  const author = video.author || video.authorName || 'قناة يوتيوب';
  const authorInitial = author.trim().charAt(0).toUpperCase();
  const avatarGradient = getAvatarGradient(author);

  const authorThumbnail = video.authorThumbnails?.[0]?.url || video.authorThumbnail || null;

  const handleClick = (e) => {
    if (e.target.closest('.action-btn')) return;
    navigateToWatch(videoId, video);
  };

  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    toggleWatchLater({
      ...video,
      thumbnail: defaultThumb
    });
  };

  const handleDirectDownload = (e) => {
    e.stopPropagation();
    if (typeof triggerBackgroundDownload === 'function') {
      triggerBackgroundDownload(video);
    }
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer flex flex-col rounded-2xl bg-[#121217] sm:bg-[#141419] border border-white/[0.06] hover:border-neon-purple/40 hover:bg-[#171722] transition-all duration-300 overflow-hidden hover:shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8),0_0_20px_-4px_rgba(139,92,246,0.2)] hover:-translate-y-1"
      dir="rtl"
    >
      {/* 16:9 Thumbnail Area */}
      <div className="relative w-full aspect-video bg-[#09090d] overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title || 'صورة الفيديو'}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Ambient Dark Gradient on bottom of thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

        {/* Hover Center Play Button Badge */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-12 h-12 rounded-full bg-neon-purple/85 backdrop-blur-md flex items-center justify-center shadow-neon-purple transform group-hover:scale-110 transition-transform">
            <Play size={20} className="text-white fill-white mr-0.5" />
          </div>
        </div>

        {/* Duration Badge */}
        {video.lengthSeconds > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/90 backdrop-blur-md text-[11px] font-bold text-white tracking-wide border border-white/10 shadow-sm">
            {duration}
          </div>
        )}

        {/* Action Buttons on Thumbnail Corner */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {/* Quick Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`action-btn p-2 rounded-xl backdrop-blur-md transition-all duration-200 ${
              bookmarked
                ? 'bg-neon-purple text-white shadow-neon-purple opacity-100'
                : 'bg-black/70 text-white/80 hover:text-white hover:bg-black/90 sm:opacity-0 sm:group-hover:opacity-100'
            }`}
            title={bookmarked ? 'إزالة من المشاهدة لاحقاً' : 'حفظ للمشاهدة لاحقاً'}
          >
            {bookmarked ? <Check size={14} strokeWidth={2.8} /> : <Bookmark size={14} />}
          </button>
        </div>
      </div>

      {/* Video Details: Mobile YouTube Native Layout */}
      <div className="p-3 sm:p-4 flex items-start gap-3 flex-1 justify-between text-right">
        
        {/* Channel Avatar (Right Side in RTL) */}
        <div className="shrink-0 mt-0.5">
          {authorThumbnail && !avatarError ? (
            <img
              src={authorThumbnail}
              alt={author}
              onError={() => setAvatarError(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-white/10 shadow-sm"
            />
          ) : (
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-sm border border-white/10`}>
              {authorInitial}
            </div>
          )}
        </div>

        {/* Middle Column: Title & Metadata */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className="text-xs sm:text-sm font-semibold text-void-100 group-hover:text-white line-clamp-2 leading-snug transition-colors mb-1.5"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Author Channel */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-void-300 group-hover:text-void-200 transition-colors truncate">
            <span className="truncate font-medium">{author}</span>
            {video.authorVerified && (
              <CheckCircle2 size={12} className="text-neon-purple shrink-0" />
            )}
          </div>

          {/* Views & Time Ago */}
          <div className="flex items-center gap-1.5 text-void-400 text-[10px] sm:text-[11px] mt-0.5">
            {views && <span>{views}</span>}
            {views && timeAgo && <span className="text-void-600">•</span>}
            {timeAgo && <span>{timeAgo}</span>}
          </div>
        </div>

        {/* Left Side: Quick Download Button */}
        <div className="shrink-0 action-btn">
          <button
            type="button"
            onClick={handleDirectDownload}
            className={`p-1.5 sm:p-2 rounded-xl transition-all active:scale-95 ${
              downloaded
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : downloadingVideos?.includes(videoId)
                ? 'text-neon-purple bg-neon-purple/15 border border-neon-purple/30'
                : 'text-void-400 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
            disabled={downloadingVideos?.includes(videoId) || downloaded}
            title={downloaded ? "تم تنزيل هذا الفيديو - متاح بقائمة التنزيلات" : "تنزيل الفيديو على الهاتف وتطبيق VoidTube"}
          >
            {downloaded ? <Check size={16} className="text-emerald-400" /> : downloadingVideos?.includes(videoId) ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          </button>
        </div>

      </div>
    </div>
  );
}
