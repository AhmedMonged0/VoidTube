import React, { useState, useEffect, useCallback } from 'react';
import { Flame, Sparkles, Plus, Loader2 } from 'lucide-react';
import { useApp, REGIONS } from '../context/AppContext';
import api from '../services/api';
import VideoGrid from '../components/VideoGrid';
import CategoryPills, { ARABIC_CATEGORIES } from '../components/CategoryPills';

export default function HomePage() {
  const { region } = useApp();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const currentRegionMeta = REGIONS.find(r => r.code === region) || REGIONS[0];

  // Fetch initial videos
  const fetchVideos = useCallback(async (catId = 'all', regionCode = region) => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);

    try {
      if (catId === 'all') {
        // Combined rich explore feed (trending + regional search, ~35-40 items)
        const data = await api.getExploreFeed({ region: regionCode, page: 1 });
        setVideos(Array.isArray(data) ? data : []);
      } else {
        const cat = ARABIC_CATEGORIES.find(c => c.id === catId);
        const query = cat ? cat.query : catId;
        const data = await api.searchVideos(query, 'video', 1);
        setVideos(Array.isArray(data) ? data : []);
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
      if (activeCategory === 'all') {
        newItems = await api.getExploreFeed({ region, page: nextPage });
      } else {
        const cat = ARABIC_CATEGORIES.find(c => c.id === activeCategory);
        const query = cat ? cat.query : activeCategory;
        newItems = await api.searchVideos(query, 'video', nextPage);
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

  // Re-fetch on category or region change
  useEffect(() => {
    fetchVideos(activeCategory, region);
  }, [activeCategory, region, fetchVideos]);

  const activeCategoryObj = ARABIC_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Category Pills Header */}
      <CategoryPills
        activeCategory={activeCategory}
        onSelectCategory={(catId) => setActiveCategory(catId)}
      />

      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
            <Flame size={18} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{activeCategoryObj ? activeCategoryObj.label : 'المحتوى الرائج'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-void-800 text-neon-purple border border-white/5 font-normal">
                {currentRegionMeta.flag} {currentRegionMeta.name}
              </span>
            </h2>
            <p className="text-xs text-void-400">
              {videos.length > 0 ? `يعرض ${videos.length} فيديو بدون إعلانات أو تشتيت` : 'جلب أحدث الفيديوهات العربية من شبكة Invidious'}
            </p>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        onRetry={() => fetchVideos(activeCategory, region)}
        emptyMessage="لم يتم العثور على فيديوهات حالياً في هذا القسم."
      />

      {/* Load More Button (Loads 20+ more videos) */}
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
