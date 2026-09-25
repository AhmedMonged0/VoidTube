import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import VideoGrid from '../components/VideoGrid';
import CategoryPills, { ARABIC_CATEGORIES } from '../components/CategoryPills';

export default function HomePage() {
  const { region, selectedCategory, setSelectedCategory } = useApp();
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
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="flex flex-col gap-4 py-2 sm:py-4">
      <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-white/[0.04]">
        <div className="flex-1 overflow-hidden">
          <CategoryPills activeCategory={selectedCategory} onSelectCategory={(catId) => {
            if (catId === selectedCategory) fetchVideos(catId, region, true);
            else setSelectedCategory(catId);
          }} />
        </div>
        <button
          onClick={() => fetchVideos(selectedCategory, region, true)}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#14141d] hover:bg-neon-purple/20 text-void-200 hover:text-white border border-white/10 hover:border-neon-purple/40 transition-all active:scale-95 shadow-sm group disabled:opacity-50"
        >
          <RefreshCw size={14} className={`text-neon-purple group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold whitespace-nowrap">محتوى جديد</span>
        </button>
      </div>

      {refreshNotification && (
        <div className="flex items-center justify-center animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/20 border border-neon-purple/50 text-white text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Sparkles size={14} className="text-neon-purple animate-pulse" />
            <span>{refreshNotification}</span>
          </div>
        </div>
      )}

      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        onRetry={() => fetchVideos(selectedCategory, region)}
        emptyMessage="لم يتم العثور على فيديوهات حالياً في هذا القسم."
      />

      {!loading && videos.length > 0 && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {loadingMore && (
            <div className="flex items-center gap-2 text-void-400 text-xs">
              <Loader2 size={16} className="animate-spin text-neon-purple" />
              <span>جارٍ تحميل المزيد...</span>
            </div>
          )}
          {!hasMore && !loadingMore && (
            <p className="text-void-600 text-xs">لا توجد فيديوهات إضافية</p>
          )}
        </div>
      )}
    </div>
  );
}
