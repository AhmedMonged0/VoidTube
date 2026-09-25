import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Loader2, RefreshCw, Sparkles } from 'lucide-react';
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

  // Fetch videos for the currently selected category with rotation & freshness
  const fetchVideos = useCallback(async (catId = 'all', regionCode = region, isRefresh = false) => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);

    if (isRefresh) {
      categoryOffsetRef.current = (categoryOffsetRef.current + 1);
    }

    try {
      if (catId === 'all') {
        const data = await api.getExploreFeed({ 
          region: regionCode, 
          page: 1, 
          forceRefresh: isRefresh 
        });
        setVideos(Array.isArray(data) ? data : []);
      } else {
        const cat = ARABIC_CATEGORIES.find(c => c.id === catId);
        let query = cat ? cat.query : catId;
        
        // Pick dynamic subquery from category pool
        if (cat && Array.isArray(cat.queries) && cat.queries.length > 0) {
          const qIdx = categoryOffsetRef.current % cat.queries.length;
          query = cat.queries[qIdx];
        }

        const data = await api.searchVideos(query, 'video', 1, { 
          bypassCache: isRefresh,
          region: regionCode 
        });
        setVideos(Array.isArray(data) ? data : []);
      }

      if (isRefresh) {
        setRefreshNotification('✨ تم تحديث الفيديوهات وجلب محتوى جديد ومميز');
        setTimeout(() => setRefreshNotification(null), 3500);
      }
    } catch (err) {
      console.error('Home feed fetch error:', err);
      setError(err.message || 'فشل تحميل الفيديوهات من الشبكة');
    } finally {
      setLoading(false);
    }
  }, [region]);

  // Load more videos (pagination)
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    try {
      let newItems = [];
      if (selectedCategory === 'all') {
        newItems = await api.getExploreFeed({ region, page: nextPage });
      } else {
        const cat = ARABIC_CATEGORIES.find(c => c.id === selectedCategory);
        let query = cat ? cat.query : selectedCategory;
        if (cat && Array.isArray(cat.queries) && cat.queries.length > 0) {
          const qIdx = (categoryOffsetRef.current + nextPage - 1) % cat.queries.length;
          query = cat.queries[qIdx];
        }
        newItems = await api.searchVideos(query, 'video', Math.floor((nextPage - 1) / 2) + 1, { region });
      }

      if (Array.isArray(newItems) && newItems.length > 0) {
        setVideos(prev => {
          const existingIds = new Set(prev.map(v => v.videoId || v.id));
          const filtered = newItems.filter(v => !existingIds.has(v.videoId || v.id));
          return [...prev, ...filtered];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Re-fetch whenever selected category or region changes
  useEffect(() => {
    fetchVideos(selectedCategory, region, false);
  }, [selectedCategory, region, fetchVideos]);

  const handleManualRefresh = () => {
    fetchVideos(selectedCategory, region, true);
  };

  const handleCategorySelect = (catId) => {
    if (catId === selectedCategory) {
      // Clicking same category again refreshes with next subquery
      fetchVideos(catId, region, true);
    } else {
      setSelectedCategory(catId);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2 sm:py-4">
      {/* Interactive Top Category Pills + New Content Refresh Button */}
      <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-white/[0.04]">
        <div className="flex-1 overflow-hidden">
          <CategoryPills
            activeCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* Dynamic New Content Button */}
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#14141d] hover:bg-neon-purple/20 text-void-200 hover:text-white border border-white/10 hover:border-neon-purple/40 transition-all active:scale-95 shadow-sm group disabled:opacity-50"
          title="تحديث الفيديوهات وتغيير المحتوى بالكامل"
        >
          <RefreshCw size={14} className={`text-neon-purple group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold whitespace-nowrap">محتوى جديد</span>
        </button>
      </div>

      {/* Floating Refresh Alert Toast */}
      {refreshNotification && (
        <div className="flex items-center justify-center animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neon-purple/20 border border-neon-purple/50 text-white text-xs font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Sparkles size={14} className="text-neon-purple animate-pulse" />
            <span>{refreshNotification}</span>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        onRetry={() => fetchVideos(selectedCategory, region)}
        emptyMessage="لم يتم العثور على فيديوهات حالياً في هذا القسم."
      />

      {/* Load More Button */}
      {!loading && videos.length > 0 && hasMore && (
        <div className="flex justify-center pt-4 pb-8">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#161620] hover:bg-neon-purple text-white text-xs font-semibold border border-white/10 hover:border-neon-purple/60 shadow-lg hover:shadow-neon-purple transition-all duration-200 disabled:opacity-50 group"
          >
            {loadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin text-neon-purple group-hover:text-white" />
                <span>جاري جلب المزيد من الفيديوهات...</span>
              </>
            ) : (
              <>
                <Plus size={16} className="group-hover:rotate-90 transition-transform duration-200" />
                <span>تحميل المزيد من الفيديوهات</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
