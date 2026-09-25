import React, { useState, useRef, useEffect } from 'react';
import { 
  Bookmark, 
  Check, 
  Play, 
  CheckCircle2, 
  Download, 
  MoreVertical, 
  Loader2, 
  Share2, 
  Radio, 
  Search,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration, formatViews, formatTimeAgo, getBestThumbnail } from '../utils/formatters';

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
  const { 
    navigateToWatch, 
    toggleWatchLater, 
    isWatchLater, 
    triggerBackgroundDownload, 
    isVideoDownloaded, 
    downloadingVideos,
    navigateToSearch,
    showToast 
  } = useApp();

  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const videoId = video.videoId || video.id;
  const bookmarked = isWatchLater(videoId);
  const downloaded = isVideoDownloaded ? isVideoDownloaded(videoId) : false;
  const isDownloading = downloadingVideos?.includes(videoId);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const defaultThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const thumbnail = !imgError 
    ? (getBestThumbnail(video.videoThumbnails, videoId) || defaultThumb) 
    : `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

  const duration = formatDuration(video.lengthSeconds);
  const isLive = video.lengthSeconds === 0 && (video.liveNow || video.publishedText?.includes('مباشر') || video.title?.includes('بث مباشر'));
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
    if (!bookmarked) {
      showToast('تمت الإضافة للمشاهدة لاحقاً ✨', 'success');
    } else {
      showToast('تمت الإزالة من المشاهدة لاحقاً', 'info');
    }
  };

  const handleDirectDownload = (e) => {
    e.stopPropagation();
    if (typeof triggerBackgroundDownload === 'function') {
      triggerBackgroundDownload(video);
    }
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const url = `https://voidtube-one.vercel.app/?v=${videoId}`;
    try {
      navigator.clipboard.writeText(url);
      showToast('تم نسخ رابط الفيديو للمشاركة! 📋', 'success');
    } catch(err) {
      showToast('تعذر نسخ الرابط', 'error');
    }
    setMenuOpen(false);
  };

  const handleChannelClick = (e) => {
    e.stopPropagation();
    navigateToSearch(author);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); }}
      className="group relative cursor-pointer flex flex-col rounded-3xl bg-[#111116] sm:bg-[#131319] border border-white/[0.05] hover:border-neon-purple/50 hover:bg-[#161622] transition-all duration-300 overflow-hidden hover:shadow-[0_16px_36px_rgba(0,0,0,0.85),0_0_25px_rgba(139,92,246,0.22)] hover:-translate-y-1.5 active:scale-[0.985]"
      dir="rtl"
    >
      {/* 16:9 Thumbnail Area */}
      <div className="relative w-full aspect-video bg-[#09090d] overflow-hidden">
        <img
          src={thumbnail}
          alt={video.title || 'صورة الفيديو'}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Ambient Dark Gradient on bottom of thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

        {/* Hover Center Play Button with ripple glow */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <div className="w-13 h-13 rounded-full bg-neon-purple/90 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.8)] border border-white/20 transform group-hover:scale-110 transition-transform">
            <Play size={22} className="text-white fill-white mr-0.5" />
          </div>
        </div>

        {/* Live or Duration Badge */}
        {isLive ? (
          <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-lg animate-pulse">
            <Radio size={12} />
            <span>مباشر</span>
          </div>
        ) : video.lengthSeconds > 0 && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-[11px] font-bold text-white tracking-wide border border-white/10 shadow-sm">
            {duration}
          </div>
        )}

        {/* Top Floating Action Pill Buttons */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 action-btn">
          {/* Quick Bookmark Button */}
          <button
            type="button"
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-xl backdrop-blur-md transition-all duration-200 active:scale-90 ${
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

      {/* Video Details Column */}
      <div className="p-3.5 sm:p-4 flex items-start gap-3 flex-1 justify-between text-right">
        
        {/* Channel Avatar (Clickable to view channel) */}
        <div 
          onClick={handleChannelClick}
          className="shrink-0 mt-0.5 action-btn group/avatar cursor-pointer relative"
          title={`استكشاف فيديوهات ${author}`}
        >
          {authorThumbnail && !avatarError ? (
            <img
              src={authorThumbnail}
              alt={author}
              onError={() => setAvatarError(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-white/10 shadow-sm group-hover/avatar:scale-105 group-hover/avatar:border-neon-purple transition-all"
            />
          ) : (
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-sm border border-white/10 group-hover/avatar:scale-105 group-hover/avatar:border-neon-purple transition-all`}>
              {authorInitial}
            </div>
          )}
        </div>

        {/* Middle Column: Title & Metadata */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className="text-xs sm:text-sm font-bold text-void-100 group-hover:text-white line-clamp-2 leading-snug transition-colors mb-1"
            title={video.title}
          >
            {video.title}
          </h3>

          {/* Author Channel */}
          <div 
            onClick={handleChannelClick}
            className="action-btn flex items-center gap-1 text-[11px] sm:text-xs text-void-300 hover:text-neon-purple transition-colors truncate cursor-pointer w-fit"
          >
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

        {/* Left Side: Download & 3-Dot Menu Actions */}
        <div className="shrink-0 flex items-center gap-1 action-btn relative" ref={menuRef}>
          {/* Direct Download Button */}
          <button
            type="button"
            onClick={handleDirectDownload}
            className={`p-2 rounded-xl transition-all active:scale-90 ${
              downloaded
                ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                : isDownloading
                ? 'text-neon-purple bg-neon-purple/15 border border-neon-purple/30'
                : 'text-void-400 hover:text-emerald-400 hover:bg-emerald-500/10'
            }`}
            disabled={isDownloading || downloaded}
            title={downloaded ? "تم تنزيل هذا الفيديو مسبقاً" : "تنزيل الفيديو بجودة 720p HD"}
          >
            {downloaded ? <Check size={16} className="text-emerald-400" /> : isDownloading ? <Loader2 size={16} className="animate-spin text-neon-purple" /> : <Download size={16} />}
          </button>

          {/* 3-Dot Options Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(prev => !prev);
            }}
            className="p-1.5 rounded-xl text-void-400 hover:text-white hover:bg-white/10 transition-colors"
            title="خيارات إضافية"
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown Menu Popup */}
          {menuOpen && (
            <div className="absolute left-0 top-full mt-1 w-44 rounded-2xl bg-[#14141d] border border-white/10 shadow-2xl p-1.5 z-30 flex flex-col gap-1 animate-fade-in backdrop-blur-xl">
              <button
                type="button"
                onClick={handleBookmarkToggle}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-void-200 hover:text-white hover:bg-white/10 transition-colors w-full text-right"
              >
                <Bookmark size={14} className="text-neon-purple" />
                <span>{bookmarked ? 'إزالة من المحفوظات' : 'المشاهدة لاحقاً'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-void-200 hover:text-white hover:bg-white/10 transition-colors w-full text-right"
              >
                <Copy size={14} className="text-cyan-400" />
                <span>نسخ رابط الفيديو</span>
              </button>

              <button
                type="button"
                onClick={handleChannelClick}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-void-200 hover:text-white hover:bg-white/10 transition-colors w-full text-right"
              >
                <Search size={14} className="text-amber-400" />
                <span>فيديوهات القناة</span>
              </button>

              <button
                type="button"
                onClick={handleDirectDownload}
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors w-full text-right font-semibold"
              >
                <Download size={14} />
                <span>تنزيل إلى الهاتف</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
