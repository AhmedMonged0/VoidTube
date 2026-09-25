import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
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

  // Fetch videos for the currently selected category from Sidebar
  const fetchVideos = useCallback(async (catId = 'all', regionCode = region) => {
    setLoading(true);
    setError(null);
    setPage(1);
    setHasMore(true);

    try {
      if (catId === 'all') {
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
      if (selectedCategory === 'all') {
        newItems = await api.getExploreFeed({ region, page: nextPage });
      } else {
        const cat = ARABIC_CATEGORIES.find(c => c.id === selectedCategory);
        const query = cat ? cat.query : selectedCategory;
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

  // Re-fetch whenever selected category or region changes
  useEffect(() => {
    fetchVideos(selectedCategory, region);
  }, [selectedCategory, region, fetchVideos]);

  const activeCategoryObj = ARABIC_CATEGORIES.find(c => c.id === selectedCategory);

  return (
    <div className="flex flex-col gap-4 py-2 sm:py-4">
      {/* Interactive Top Category Pills + Refresh Bar */}
      <div className="flex items-center justify-between gap-2.5 pb-2 border-b border-white/[0.04]">
        <div className="flex-1 overflow-hidden">
          <CategoryPills
            activeCategory={selectedCategory}
            onSelectCategory={(catId) => setSelectedCategory(catId)}
          />
        </div>
        <button
          onClick={() => fetchVideos(selectedCategory, region)}
          disabled={loading}
          className="shrink-0 p-2 rounded-full bg-[#14141d] hover:bg-neon-purple/20 text-void-300 hover:text-white border border-white/10 hover:border-neon-purple/30 transition-all active:scale-90 shadow-sm"
          title="تحديث الفيديوهات"
        >
          <RefreshCw size={15} className={`text-neon-purple ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

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
