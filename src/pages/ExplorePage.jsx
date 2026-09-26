import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Flame, 
  Headphones, 
  Terminal, 
  BookOpen, 
  Tv, 
  Gamepad2, 
  Sparkles, 
  Play, 
  Trophy, 
  TrendingUp, 
  Globe,
  Loader2
} from 'lucide-react';
import { useApp, REGIONS } from '../context/AppContext';
import api from '../services/api';
import VideoCard from '../components/VideoCard';
import { formatViews, formatDuration, formatTimeAgo } from '../utils/formatters';

const EXPLORE_CATEGORIES = [
  { id: 'podcasts', title: 'بودكاست وحوارات', icon: Headphones, query: 'بودكاست عربي حوارات جديدة', color: 'from-amber-600 to-rose-600', glow: '#f59e0b' },
  { id: 'tech', title: 'برمجة وتكنولوجيا', icon: Terminal, query: 'تكنولوجيا وبرمجة ذكاء اصطناعي', color: 'from-cyan-600 to-blue-700', glow: '#06b6d4' },
  { id: 'quran', title: 'قرآن وتأملات', icon: BookOpen, query: 'تلاوات خاشعة وتأملات قرآنية', color: 'from-emerald-600 to-teal-700', glow: '#10b981' },
  { id: 'lofi', title: 'تركيز ومذاكرة Lo-Fi', icon: Sparkles, query: 'lofi hip hop deep focus study chill', color: 'from-purple-600 to-indigo-700', glow: '#8b5cf6' },
  { id: 'docs', title: 'وثائقيات وعلوم', icon: Tv, query: 'وثائقيات علمية وتاريخية شيقة بالعربي', color: 'from-fuchsia-600 to-pink-700', glow: '#d946ef' },
  { id: 'gaming', title: 'ألعاب ومغامرات', icon: Gamepad2, query: 'العاب وتحديات جيمنج عربي', color: 'from-red-600 to-orange-600', glow: '#ef4444' },
];

export default function ExplorePage() {
  const { region, setRegion, navigateToWatch, showToast } = useApp();
  const [selectedCat, setSelectedCat] = useState(null);
  const [categoryVideos, setCategoryVideos] = useState([]);
  const [spotlights, setSpotlights] = useState([]);
  const [activeSpotlightIdx, setActiveSpotlightIdx] = useState(0);
  const [trendingLeaderboard, setTrendingLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(false);

  // Load spotlights & trending leaderboard
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      api.getSpotlightVideos(region),
      api.getTrending(region)
    ]).then(([spotlightRes, trendingRes]) => {
      if (isMounted) {
        if (spotlightRes.status === 'fulfilled' && Array.isArray(spotlightRes.value)) {
          setSpotlights(spotlightRes.value.slice(0, 5));
        }
        if (trendingRes.status === 'fulfilled' && Array.isArray(trendingRes.value)) {
          setTrendingLeaderboard(trendingRes.value.slice(0, 10));
        }
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [region]);

  // Load category videos when a tile is clicked
  const handleSelectCategory = async (cat) => {
    if (selectedCat?.id === cat.id) {
      setSelectedCat(null);
      setCategoryVideos([]);
      return;
    }
    setSelectedCat(cat);
    setLoadingCategory(true);
    try {
      const res = await api.searchVideos(cat.query, 'video', 1, { region });
      setCategoryVideos(Array.isArray(res) ? res : []);
    } catch (err) {
      console.warn('Category fetch error:', err);
      setCategoryVideos([]);
    } finally {
      setLoadingCategory(false);
    }
  };

  const activeSpotlight = spotlights[activeSpotlightIdx] || trendingLeaderboard[0] || null;

  return (
    <div className="w-full pb-16 animate-fade-in text-right" dir="rtl">
      
      {/* 1. Header with Region Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Compass size={24} className="text-neon-purple animate-pulse" />
            مركز الاستكشاف والتريند (Explore Hub)
          </h1>
          <p className="text-xs text-void-300 mt-1">
            أقوى المحتويات الصاعدة والتصنيفات الرائجة بدون خوارزميات مصيدة.
          </p>
        </div>

        {/* Region Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-card shrink-0 self-start sm:self-auto">
          {REGIONS.map((r) => (
            <button
              key={r.code}
              onClick={() => {
                setRegion(r.code);
                showToast(`تم تعيين المنطقة: ${r.name} ${r.flag}`, 'info');
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                region === r.code
                  ? 'bg-neon-purple text-white shadow-neon-purple'
                  : 'text-void-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span>{r.flag}</span>
              <span>{r.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Spotlight Featured Hero Carousel */}
      {activeSpotlight && (
        <div className="relative rounded-3xl overflow-hidden glass-card border border-white/[0.08] mb-8 group shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <img
              src={
                activeSpotlight.videoThumbnails?.[0]?.url ||
                activeSpotlight.thumbnail ||
                `https://i.ytimg.com/vi/${activeSpotlight.videoId || activeSpotlight.id}/maxresdefault.jpg`
              }
              alt={activeSpotlight.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          </div>

          {/* Spotlight Details Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 flex flex-col items-start gap-3">
            <span className="px-3 py-1 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/40 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Flame size={14} className="fill-neon-purple" />
              محتوى مميز في التريند
            </span>

            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white max-w-2xl line-clamp-2 leading-tight">
              {activeSpotlight.title}
            </h2>

            <div className="flex items-center gap-3 text-xs text-void-300">
              <span className="font-bold text-white">{activeSpotlight.author}</span>
              <span>•</span>
              <span>{formatViews(activeSpotlight.viewCount)}</span>
              <span>•</span>
              <span>{formatDuration(activeSpotlight.lengthSeconds)}</span>
            </div>

            <button
              onClick={() => navigateToWatch(activeSpotlight.videoId || activeSpotlight.id, activeSpotlight)}
              className="mt-1 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black hover:bg-neon-purple hover:text-white font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 group/btn"
            >
              <Play size={16} className="fill-current" />
              <span>مشاهدة الآن</span>
            </button>
          </div>

          {/* Pagination Indicators */}
          {spotlights.length > 1 && (
            <div className="absolute bottom-4 left-6 flex items-center gap-1.5">
              {spotlights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSpotlightIdx(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === activeSpotlightIdx ? 'w-6 bg-neon-purple shadow-[0_0_10px_#8b5cf6]' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* 3. Visual Category Tiles Grid */}
      <div className="mb-10">
        <h3 className="text-base font-black text-white mb-3.5 flex items-center gap-2">
          <Sparkles size={18} className="text-neon-purple" />
          تصفح حسب التصنيف (Explore by Category)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {EXPLORE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCat?.id === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat)}
                className={`relative rounded-2xl p-4 cursor-pointer overflow-hidden border transition-all duration-300 active:scale-95 group flex flex-col justify-between h-28 ${
                  isSelected
                    ? 'border-white bg-gradient-to-br shadow-2xl scale-[1.02]'
                    : 'border-white/[0.06] glass-card hover:border-white/20'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 25px ${cat.glow}` : undefined
                }}
              >
                {/* Background ambient gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-20 group-hover:opacity-35 transition-opacity`} />

                <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform">
                  <Icon size={18} />
                </div>

                <div className="relative z-10">
                  <h4 className="text-xs font-black text-white tracking-tight">{cat.title}</h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Selected Section */}
      {selectedCat && (
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-cyan-400" />
              أحدث مقاطع: {selectedCat.title}
            </h3>
            <button
              onClick={() => setSelectedCat(null)}
              className="text-xs text-void-400 hover:text-white"
            >
              إغلاق التصنيف ✕
            </button>
          </div>

          {loadingCategory ? (
            <div className="py-12 flex justify-center">
              <Loader2 size={32} className="text-neon-purple animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryVideos.map((vid, idx) => (
                <VideoCard key={vid.videoId || idx} video={vid} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Top 10 Regional Trending Leaderboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            قائمة التريند الأعلى مشاهدة (Top 10 Leaderboard)
          </h3>
          <span className="text-xs text-void-400 font-medium">محدّث لحظياً</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {trendingLeaderboard.map((item, index) => {
            const rank = index + 1;
            const rankBadge =
              rank === 1 ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
              rank === 2 ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
              rank === 3 ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' :
              'bg-white/[0.04] text-void-400 border-white/[0.06]';

            return (
              <div
                key={item.videoId || item.id || index}
                onClick={() => navigateToWatch(item.videoId || item.id, item)}
                className="flex items-center gap-3.5 p-3 rounded-2xl glass-card hover:bg-white/[0.06] cursor-pointer transition-all border border-white/[0.05] group active:scale-[0.99]"
              >
                {/* Rank Number Badge */}
                <div className={`w-8 h-8 rounded-xl font-black text-sm flex items-center justify-center font-mono border shrink-0 ${rankBadge}`}>
                  {rank}
                </div>

                {/* Thumbnail */}
                <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-black shrink-0">
                  <img
                    src={item.videoThumbnails?.[0]?.url || item.thumbnail || `https://i.ytimg.com/vi/${item.videoId || item.id}/mqdefault.jpg`}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {item.lengthSeconds > 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.2 rounded bg-black/85 text-[10px] font-bold text-white font-mono">
                      {formatDuration(item.lengthSeconds)}
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white line-clamp-2 group-hover:text-neon-purple transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-void-400 mt-1 truncate">{item.author}</span>
                  <div className="flex items-center gap-2 text-[10px] text-void-500 mt-0.5 font-mono">
                    <span>{formatViews(item.viewCount)}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(item.published || item.publishedText)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
