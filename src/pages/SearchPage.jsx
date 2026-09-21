import React, { useState, useEffect } from 'react';
import { Search, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import VideoGrid from '../components/VideoGrid';

export default function SearchPage() {
  const { nav, navigateToHome } = useApp();
  const query = nav.query || '';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api.searchVideos(query, 'video')
      .then((data) => {
        // Filter out playlists/channels if any returned
        const list = Array.isArray(data) ? data.filter(item => item.type === 'video' || item.videoId) : [];
        setVideos(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Search error:', err);
        setError(err.message || 'Failed to search YouTube videos');
        setLoading(false);
      });
  }, [query]);

  const handleRetry = () => {
    if (!query) return;
    setLoading(true);
    setError(null);
    api.searchVideos(query, 'video')
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
    <div className="flex flex-col gap-6 py-6">
      {/* Search Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
            <Search size={18} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Results for: <span className="text-neon-purple">"{query}"</span>
            </h2>
            <p className="text-xs text-void-400">
              {loading ? 'Searching YouTube...' : `Found ${videos.length} videos`}
            </p>
          </div>
        </div>

        <button
          onClick={navigateToHome}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-void-800 hover:bg-void-750 text-xs font-medium text-void-300 hover:text-white border border-white/5 transition-all"
        >
          <Compass size={13} />
          Back to Explore
        </button>
      </div>

      {/* Grid */}
      <VideoGrid
        videos={videos}
        loading={loading}
        error={error}
        onRetry={handleRetry}
        emptyMessage={`No videos found matching "${query}". Try different keywords.`}
      />
    </div>
  );
}
