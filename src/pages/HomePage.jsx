import React, { useState, useEffect, useCallback } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import api from '../services/api';
import VideoGrid from '../components/VideoGrid';
import CategoryPills from '../components/CategoryPills';

export default function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('trending');

  const fetchTrending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTrending('US');
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Trending fetch error:', err);
      setError(err.message || 'Failed to fetch trending videos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount or when category changes
  useEffect(() => {
    if (activeCategory === 'trending' || activeCategory === 'all') {
      fetchTrending();
    } else {
      // Category search query
      setLoading(true);
      setError(null);
      api.searchVideos(activeCategory, 'video')
        .then(data => {
          setVideos(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [activeCategory, fetchTrending]);

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Category Pills Header */}
      <CategoryPills
        activeCategory={activeCategory}
        onSelectCategory={(catId) => setActiveCategory(catId)}
      />

      {/* Title / Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
            <Flame size={18} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {activeCategory === 'trending' || activeCategory === 'all'
                ? 'Trending Videos'
                : `Explore: ${activeCategory.toUpperCase()}`}
            </h2>
            <p className="text-xs text-void-400">
              Direct, distraction-free stream from the Invidious network
            </p>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        onRetry={fetchTrending}
        emptyMessage="No trending videos currently returned by the active instance."
      />
    </div>
  );
}
