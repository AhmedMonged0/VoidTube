import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MoreVertical, 
  CheckCircle2, 
  Play, 
  ListVideo, 
  Flame, 
  Info, 
  Share2, 
  ExternalLink, 
  Loader2, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import VideoCard from '../components/VideoCard';
import SkeletonLoader from '../components/SkeletonLoader';

const TABS = [
  { id: 'videos', label: 'فيديوهات (Videos)', icon: Play },
  { id: 'playlists', label: 'قوائم التشغيل (Playlists)', icon: ListVideo },
  { id: 'popular', label: 'الأكثر شعبية (Popular)', icon: Flame },
  { id: 'about', label: 'حول القناة (About)', icon: Info },
];

const FILTERS = [
  { id: 'latest', label: 'الأحدث (Latest)' },
  { id: 'popular', label: 'الأعلى مشاهدة (Most Viewed)' },
  { id: 'oldest', label: 'الأقدم (Oldest)' },
];

export default function ChannelPage() {
  const { nav, navigateToHome, navigateToWatch, showToast } = useApp();
  const channelId = nav.channelId;
  const passedData = nav.channelData;

  const [channelInfo, setChannelInfo] = useState(() => passedData || null);
  const [activeTab, setActiveTab] = useState('videos');
  const [activeFilter, setActiveFilter] = useState('latest');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Load Channel Info
  useEffect(() => {
    if (!channelId) return;
    let isMounted = true;
    setLoading(true);

    api.getChannelDetails(channelId, passedData?.author)
      .then((data) => {
        if (isMounted) {
          setChannelInfo(prev => ({ ...(prev || {}), ...data }));
          setLoading(false);
          if (data.author) {
            document.title = `${data.author} — VoidTube`;
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Channel details error:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      document.title = 'VoidTube — Cinematic Distraction-Free Streaming';
    };
  }, [channelId]);

  // Load Channel Videos based on active filter or tab
  useEffect(() => {
    if (!channelId) return;
    let isMounted = true;
    setLoadingVideos(true);

    const sortOption = activeTab === 'popular' ? 'popular' : activeFilter;
    const authorName = channelInfo?.author || passedData?.author || channelId;

    api.getChannelVideos(channelId, authorName, sortOption)
      .then((list) => {
        if (isMounted) {
          setVideos(Array.isArray(list) ? list : []);
          setLoadingVideos(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('Failed to load channel videos:', err);
          setVideos([]);
          setLoadingVideos(false);
        }
      });

    return () => { isMounted = false; };
  }, [channelId, channelInfo?.author, activeTab, activeFilter]);

  const authorName = channelInfo?.author || passedData?.author || 'قناة يوتيوب';
  const authorHandle = channelInfo?.authorHandle || `@${authorName.replace(/\s+/g, '_').toLowerCase()}`;
  const subCount = channelInfo?.subCountText || (channelInfo?.subCount ? `${channelInfo.subCount} مشترك` : '1.2M Subscribed');
  const avatarUrl = channelInfo?.authorThumbnails?.[channelInfo.authorThumbnails.length - 1]?.url
    || channelInfo?.authorThumbnails?.[0]?.url
    || passedData?.authorThumbnail
    || `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop`;

  const bannerUrl = channelInfo?.authorBanners?.[0]?.url
    || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1600&auto=format&fit=crop';

  // Filter videos by in-channel search if user typed a query
  const displayedVideos = searchQuery.trim()
    ? videos.filter(v => (v.title || '').toLowerCase().includes(searchQuery.toLowerCase()))
    : videos;

  const handleShare = () => {
    const url = window.location.href;
    try {
      navigator.clipboard.writeText(url);
      showToast('تم نسخ رابط القناة بنجاح! 📋', 'success');
    } catch {
      showToast('تعذر نسخ الرابط', 'error');
    }
  };

  return (
    <div className="w-full pb-16 animate-fade-in" dir="rtl">
      
      {/* 1. Android / Mobile Top Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 mb-2 bg-[#0a0a0c]/80 backdrop-blur-md rounded-2xl border border-white/[0.04]">
        <button
          onClick={navigateToHome}
          className="flex items-center gap-1.5 p-2 rounded-xl text-void-300 hover:text-white hover:bg-white/10 transition-colors"
          title="رجوع للرئيسية"
        >
          <ArrowLeft size={20} className="rotate-180" />
          <span className="text-xs font-bold hidden sm:inline">الرئيسية</span>
        </button>

        {/* In-channel search input */}
        {isSearchOpen ? (
          <div className="flex-1 max-w-md mx-3 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`البحث داخل قناة ${authorName}...`}
              autoFocus
              className="w-full bg-[#14141c] border border-neon-purple/40 rounded-full px-4 py-1.5 text-xs text-white placeholder-void-400 focus:outline-none"
            />
          </div>
        ) : (
          <span className="text-xs font-black text-white/90 truncate max-w-[200px] text-center">
            {authorName}
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsSearchOpen(prev => !prev)}
            className={`p-2 rounded-xl transition-colors ${isSearchOpen ? 'bg-neon-purple/20 text-neon-purple' : 'text-void-300 hover:text-white hover:bg-white/10'}`}
            title="بحث داخل القناة"
          >
            <Search size={18} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-void-300 hover:text-white hover:bg-white/10 transition-colors"
            title="مشاركة القناة"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* 2. Channel Hero Banner with Curved Neon Cutout */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-white/[0.08] bg-[#0c0c12]">
        
        {/* Banner Image with high-contrast cyberpunk lighting */}
        <div className="relative w-full h-44 sm:h-56 md:h-72 overflow-hidden">
          <img
            src={bannerUrl}
            alt={`${authorName} Banner`}
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          {/* Neon gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-transparent to-pink-500/20 mix-blend-overlay" />
          
          {/* Curved bottom neon edge glow */}
          <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#0a0a0c] to-transparent" />
        </div>

        {/* 3. Floating Centered Avatar & Channel Info (Exact representation of Android Screenshot) */}
        <div className="relative px-4 pb-6 pt-0 flex flex-col items-center text-center -mt-16 sm:-mt-20">
          
          {/* Glowing Centered Avatar */}
          <div className="relative group">
            {/* Outer glowing pulsing ring */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-neon-purple via-pink-500 to-cyan-400 opacity-80 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />
            
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#0a0a0c] bg-[#141419] shadow-2xl">
              <img
                src={avatarUrl}
                alt={authorName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Verified Floating Badge */}
            <div className="absolute bottom-1 right-1 p-1 rounded-full bg-[#0a0a0c] shadow-lg">
              <CheckCircle2 size={18} className="text-cyan-400 fill-cyan-400/20" />
            </div>
          </div>

          {/* Channel Name & Verified check */}
          <div className="mt-3 flex items-center gap-1.5 justify-center">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {authorName}
            </h1>
            <CheckCircle2 size={18} className="text-cyan-400 fill-cyan-400/20" />
          </div>

          {/* Handle & Subscriber Count */}
          <p className="text-xs sm:text-sm text-void-300 font-medium mt-1 tracking-wide flex items-center gap-2">
            <span className="text-neon-purple font-mono">{authorHandle}</span>
            <span>•</span>
            <span className="font-semibold text-white/80">{subCount}</span>
          </p>

          {/* Optional Channel Bio / Description preview */}
          {channelInfo?.description && (
            <p className="text-xs text-void-400 max-w-xl mt-2 line-clamp-2 leading-relaxed px-4">
              {channelInfo.description}
            </p>
          )}

        </div>

      </div>

      {/* 4. Android Tab Layout (Videos, Playlists, Popular, About) */}
      <div className="sticky top-16 z-30 bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-white/[0.06] mt-4 px-2">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-purple to-purple-700 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-neon-purple/40'
                    : 'text-void-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-white' : 'text-void-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Filter Chips (for Videos Tab: Latest, Most Viewed, Oldest) */}
      {activeTab === 'videos' && (
        <div className="flex items-center gap-2 px-2 py-3 mt-1 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-void-400 flex items-center gap-1 ml-1">
            <SlidersHorizontal size={13} />
            تصفية:
          </span>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/50 shadow-sm'
                    : 'bg-white/[0.04] text-void-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.04]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {/* 6. Content Section */}
      <div className="mt-4 px-1 sm:px-2">
        {loadingVideos ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : activeTab === 'about' ? (
          /* About Tab Content */
          <div className="rounded-3xl glass-card p-6 max-w-2xl mx-auto flex flex-col gap-4 text-right">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Info size={18} className="text-neon-purple" />
              تفاصيل القناة
            </h3>
            <p className="text-xs sm:text-sm text-void-300 leading-relaxed whitespace-pre-line">
              {channelInfo?.description || 'لا يوجد وصف تفصيلي متوفر لهذه القناة.'}
            </p>
            <div className="pt-4 border-t border-white/[0.06] flex flex-wrap gap-4 text-xs text-void-400">
              <div>
                <span className="text-void-500">اسم القناة: </span>
                <span className="text-white font-bold">{authorName}</span>
              </div>
              {subCount && (
                <div>
                  <span className="text-void-500">المشتركون: </span>
                  <span className="text-emerald-400 font-bold">{subCount}</span>
                </div>
              )}
            </div>
          </div>
        ) : displayedVideos.length === 0 ? (
          /* Empty state */
          <div className="py-16 text-center flex flex-col items-center justify-center glass-card rounded-3xl p-8">
            <Play size={40} className="text-void-500 mb-3 opacity-50" />
            <h3 className="text-sm font-bold text-white mb-1">لم يتم العثور على مقاطع</h3>
            <p className="text-xs text-void-400 max-w-xs">
              {searchQuery ? `لا توجد نتائج تطابق "${searchQuery}"` : 'لم يتم استرجاع فيديوهات لهذه القناة حالياً.'}
            </p>
          </div>
        ) : (
          /* 2-Column Mobile Grid / 3-4 Column Desktop Grid (Matching Screenshot) */
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayedVideos.map((vid, idx) => (
              <VideoCard
                key={vid.videoId || vid.id || idx}
                video={{
                  ...vid,
                  author: authorName,
                  authorThumbnail: avatarUrl
                }}
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
