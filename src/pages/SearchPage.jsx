import React, { useState, useEffect } from 'react';
import { Search, Compass, Sparkles, Filter, AlertCircle, RotateCcw, Video, Radio, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import VideoGrid from '../components/VideoGrid';

export default function SearchPage() {
  const { nav, navigateToHome, region } = useApp();
  const query = nav.query || '';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('relevance');

  useEffect(() => {
    if (!query) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const sortOption = activeFilter === 'upload_date' 
      ? 'upload_date' 
      : activeFilter === 'view_count' 
      ? 'view_count' 
      : 'relevance';

    api.searchVideos(query, 'video', 1, { region, sortBy: sortOption })
      .then((data) => {
        const list = Array.isArray(data) ? data.filter(item => item.type === 'video' || item.videoId) : [];
        setVideos(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setError(err.message || 'تعذر جلب نتائج البحث من الخوادم');
        setLoading(false);
      });
  }, [query, activeFilter, region]);

  const handleRetry = () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    api.searchVideos(query, 'video', 1, { region })
      .then(d => {
        setVideos(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col gap-5 py-4 sm:py-6" dir="rtl">
      {/* Search Header Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-[#12121a] via-[#101016] to-[#12121a] border border-white/[0.06] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-neon-purple/15 text-neon-purple border border-neon-purple/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0">
            <Search size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                نتائج البحث عن:
              </h1>
              <span className="text-sm sm:text-base font-extrabold text-neon-purple bg-neon-purple/10 px-3 py-0.5 rounded-full border border-neon-purple/20">
                &quot;{query}&quot;
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-void-400 mt-1">
              {loading ? 'جارٍ البحث في شبكة يوتيوب...' : `تم العثور على ${videos.length} فيديو مناسب`}
            </p>
          </div>
        </div>

        <button
          onClick={navigateToHome}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#171724] hover:bg-neon-purple/20 text-xs font-semibold text-void-200 hover:text-white border border-white/10 hover:border-neon-purple/40 transition-all active:scale-95 shadow-sm"
        >
          <Compass size={14} className="text-neon-purple" />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-bold text-void-400 flex items-center gap-1 shrink-0 ml-1">
          <Filter size={13} />
          <span>ترتيب:</span>
        </span>

        <button
          onClick={() => setActiveFilter('relevance')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 ${
            activeFilter === 'relevance'
              ? 'bg-neon-purple text-white shadow-neon-purple'
              : 'bg-[#14141c] hover:bg-[#1a1a24] text-void-300 hover:text-white border border-white/5'
          }`}
        >
          الأكثر صلة
        </button>

        <button
          onClick={() => setActiveFilter('upload_date')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 ${
            activeFilter === 'upload_date'
              ? 'bg-neon-purple text-white shadow-neon-purple'
              : 'bg-[#14141c] hover:bg-[#1a1a24] text-void-300 hover:text-white border border-white/5'
          }`}
        >
          الأحدث رفعاً
        </button>

        <button
          onClick={() => setActiveFilter('view_count')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 active:scale-95 ${
            activeFilter === 'view_count'
              ? 'bg-neon-purple text-white shadow-neon-purple'
              : 'bg-[#14141c] hover:bg-[#1a1a24] text-void-300 hover:text-white border border-white/5'
          }`}
        >
          الأعلى مشاهدة
        </button>
      </div>

      {/* Video Results Grid */}
      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        onRetry={handleRetry}
        emptyMessage={`لم يتم العثور على فيديوهات تطابق "${query}". جرب كلمات بحث أخرى.`}
      />
    </div>
  );
}
