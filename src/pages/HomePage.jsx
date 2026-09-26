import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, RefreshCw, Sparkles, Headphones, Compass, Play, Flame, Disc } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import VideoGrid from '../components/VideoGrid';
import CategoryPills, { ARABIC_CATEGORIES } from '../components/CategoryPills';
import { formatDuration, formatViews } from '../utils/formatters';

export default function HomePage() {
  const {
    region,
    selectedCategory,
    setSelectedCategory,
    navigateToAudio,
    navigateToExplore,
    navigateToWatch
  } = useApp();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshNotification, setRefreshNotification] = useState(null);

  const categoryOffsetRef = useRef(0);
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const selectedCategoryRef = useRef(selectedCategory);

  useEffect(() => { selectedCategoryRef.current = selectedCategory; }, [selectedCategory]);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);

  const fetchVideos = useCallback(async (catId = 'all', regionCode = region, isRefresh = false) => {
    setLoading(true);
    setError(null);
    setPage(1);
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    loadingMoreRef.current = false;

    if (isRefresh) categoryOffsetRef.current += 1;

    try {
      let data = [];
      if (catId === 'all') {
        data = await api.getExploreFeed({ region: regionCode, page: 1, forceRefresh: isRefresh });
      } else {
        const cat = ARABIC_CATEGORIES.find(c => c.id === catId);
        let query = cat ? cat.query : catId;
        if (cat && Array.isArray(cat.queries) && cat.queries.length > 0) {
          query = cat.queries[categoryOffsetRef.current % cat.queries.length];
        }
        data = await api.searchVideos(query, 'video', 1, { bypassCache: isRefresh, region: regionCode });
      }
      setVideos(Array.isArray(data) ? data : []);
      if (isRefresh) {
        setRefreshNotification('✨ تم تحديث الفيديوهات وجلب محتوى جديد ومميز');
        setTimeout(() => setRefreshNotification(null), 3500);
      }
    } catch (err) {
      setError(err.message || 'فشل تحميل الفيديوهات من الشبكة');
    } finally {
      setLoading(false);
    }
  }, [region]);

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    const nextPage = pageRef.current + 1;
    const catId = selectedCategoryRef.current;

    try {
      let newItems = [];
      if (catId === 'all') {
        newItems = await api.getExploreFeed({ region, page: nextPage });
      } else {
        const cat = ARABIC_CATEGORIES.find(c => c.id === catId);
        let query = cat ? cat.query : catId;
        if (cat && Array.isArray(cat.queries) && cat.queries.length > 0) {
          query = cat.queries[(categoryOffsetRef.current + nextPage - 1) % cat.queries.length];
        }
        newItems = await api.searchVideos(query, 'video', Math.floor((nextPage - 1) / 2) + 1, { region });
      }

      if (Array.isArray(newItems) && newItems.length > 0) {
        setVideos(prev => {
          const existingIds = new Set(prev.map(v => v.videoId || v.id));
          return [...prev, ...newItems.filter(v => !existingIds.has(v.videoId || v.id))];
        });
        setPage(nextPage);
        pageRef.current = nextPage;
      } else {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch (err) {
      console.warn('Infinite scroll error:', err);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }, [region]);

  useEffect(() => {
    fetchVideos(selectedCategory, region, false);
  }, [selectedCategory, region, fetchVideos]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '1200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const featuredVideo = (selectedCategory === 'all' && videos.length > 0) ? videos[0] : null;
  const gridVideos = featuredVideo ? videos.slice(1) : videos;

  return (
    <div className="flex flex-col gap-5 py-2 sm:py-4 text-right" dir="rtl">
      
      {/* 1. Quick Feature Hub Banners: Focus Audio & Explore */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Banner 1: Audio & Focus Vinyl Player */}
        <div
          onClick={() => navigateToAudio()}
          className="relative rounded-2xl p-4 glass-card border border-white/[0.08] hover:border-neon-purple/50 cursor-pointer overflow-hidden group transition-all duration-300 active:scale-[0.99] flex items-center justify-between"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/25 via-pink-900/15 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-neon-purple to-pink-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:scale-105 transition-transform">
              <Headphones size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-black text-white">وضع التركيز الصوتي (Audio Focus)</h3>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded-full border border-emerald-500/30">جديد</span>
              </div>
              <p className="text-[11px] text-void-400">مشغل Vinyl سينمائي مع Soundwave للبودكاست والموسيقى</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:flex items-center text-neon-purple text-xs font-bold gap-1 group-hover:translate-x-[-4px] transition-transform">
            <span>دخول</span>
            <span>←</span>
          </div>
        </div>

        {/* Banner 2: Explore Hub */}
        <div
          onClick={() => navigateToExplore()}
          className="relative rounded-2xl p-4 glass-card border border-white/[0.08] hover:border-cyan-500/50 cursor-pointer overflow-hidden group transition-all duration-300 active:scale-[0.99] flex items-center justify-between"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/25 via-blue-900/15 to-transparent pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] group-hover:scale-105 transition-transform">
              <Compass size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-black text-white">مركز الاستكشاف والتريند (Explore)</h3>
                <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/15 px-1.5 py-0.2 rounded-full border border-cyan-500/30">Hub</span>
              </div>
              <p className="text-[11px] text-void-400">توب 10 التريند العربي وتصنيفات البرمجة والبودكاست والقرآن</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:flex items-center text-cyan-400 text-xs font-bold gap-1 group-hover:translate-x-[-4px] transition-transform">
            <span>استكشف</span>
            <span>←</span>
          </div>
        </div>
      </div>

      {/* 2. Top Category Pills & Refresh Action */}
      <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-white/[0.04]">
        <div className="flex-1 overflow-hidden">
          <CategoryPills
            activeCategory={selectedCategory}
            onSelectCategory={(catId) => {
              if (catId === selectedCategory) fetchVideos(catId, region, true);
              else setSelectedCategory(catId);
            }}
          />
        </div>
        <button
          onClick={() => fetchVideos(selectedCategory, region, true)}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-card text-void-200 hover:text-white transition-all active:scale-95 group disabled:opacity-50"
          title="تحديث واستدعاء فيديوهات جديدة تماماً"
        >
          <RefreshCw
            size={14}
            className={`text-neon-purple group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`}
          />
          <span className="text-xs font-bold whitespace-nowrap">محتوى جديد</span>
        </button>
      </div>

      {/* Refresh notification toast */}
      {refreshNotification && (
        <div className="flex items-center justify-center animate-fade-in">
          <div className="px-4 py-2 rounded-2xl bg-neon-purple/20 border border-neon-purple/30 text-neon-purple text-xs font-bold shadow-neon-purple backdrop-blur-md">
            {refreshNotification}
          </div>
        </div>
      )}

      {/* 3. Featured Spotlight Card (Shown at top of homepage when on 'All' category) */}
      {featuredVideo && !loading && (
        <div
          onClick={() => navigateToWatch(featuredVideo.videoId || featuredVideo.id, featuredVideo)}
          className="relative rounded-3xl overflow-hidden glass-card border border-white/[0.08] cursor-pointer group shadow-[0_10px_35px_rgba(0,0,0,0.7)] active:scale-[0.99] transition-all"
        >
          <div className="relative w-full h-52 sm:h-72 md:h-80 overflow-hidden">
            <img
              src={
                featuredVideo.videoThumbnails?.[0]?.url ||
                featuredVideo.thumbnail ||
                `https://i.ytimg.com/vi/${featuredVideo.videoId || featuredVideo.id}/maxresdefault.jpg`
              }
              alt={featuredVideo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/25 to-transparent" />
          </div>

          <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 flex flex-col items-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/40 text-[10px] font-black flex items-center gap-1">
              <Flame size={12} className="fill-neon-purple" />
              فيديو مميز مقترح لك
            </span>
            <h2 className="text-sm sm:text-xl md:text-2xl font-black text-white max-w-2xl line-clamp-2 leading-tight">
              {featuredVideo.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-void-300">
              <span className="font-bold text-white">{featuredVideo.author}</span>
              <span>•</span>
              <span>{formatViews(featuredVideo.viewCount)}</span>
              <span>•</span>
              <span>{formatDuration(featuredVideo.lengthSeconds)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Video Grid Main Feed */}
      <VideoGrid videos={gridVideos} loading={loading} error={error} onRetry={() => fetchVideos(selectedCategory, region, false)} />

      {/* 5. Infinite Scroll Sentinel & Loader */}
      <div ref={sentinelRef} className="w-full py-8 flex flex-col items-center justify-center min-h-[60px]">
        {loadingMore && (
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl glass-card text-void-300 text-xs font-semibold animate-pulse">
            <Loader2 size={16} className="text-neon-purple animate-spin" />
            <span>جاري تحميل المزيد من المحتوى المقترح تلقائياً...</span>
          </div>
        )}
        {!hasMore && !loading && videos.length > 0 && (
          <div className="text-center text-void-500 text-xs py-4">
            وصلت لنهاية قائمة الفيديوهات المقترحة لهذه الجلسة 🌌
          </div>
        )}
      </div>

    </div>
  );
}
