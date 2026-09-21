import React, { useState } from 'react';
import { Bookmark, History, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import VideoCard from '../components/VideoCard';

export default function BookmarksPage() {
  const { watchLater, clearAllWatchLater, history, navigateToHome } = useApp();
  const [activeTab, setActiveTab] = useState('watchLater'); // 'watchLater' | 'history'

  const currentList = activeTab === 'watchLater' ? watchLater : history;

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
            {activeTab === 'watchLater' ? <Bookmark size={20} /> : <History size={20} />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {activeTab === 'watchLater' ? 'Watch Later Playlist' : 'Recent Watch History'}
            </h2>
            <p className="text-xs text-void-400">
              {currentList.length} {currentList.length === 1 ? 'video' : 'videos'} saved locally on this device
            </p>
          </div>
        </div>

        {/* Tab switcher & actions */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-[#141419] border border-white/5">
            <button
              onClick={() => setActiveTab('watchLater')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'watchLater'
                  ? 'bg-neon-purple text-white shadow-neon-purple'
                  : 'text-void-400 hover:text-white'
              }`}
            >
              <Bookmark size={13} />
              Watch Later ({watchLater.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-neon-purple text-white shadow-neon-purple'
                  : 'text-void-400 hover:text-white'
              }`}
            >
              <History size={13} />
              History ({history.length})
            </button>
          </div>

          {activeTab === 'watchLater' && watchLater.length > 0 && (
            <button
              onClick={clearAllWatchLater}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-400 text-xs font-semibold border border-red-500/20 transition-all"
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid or Empty */}
      {currentList.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#141419] border border-white/5 flex items-center justify-center text-void-500 mb-4">
            <Bookmark size={28} />
          </div>
          <h3 className="text-base font-bold text-void-200 mb-1">
            {activeTab === 'watchLater' ? 'No videos in Watch Later' : 'No watch history recorded yet'}
          </h3>
          <p className="text-xs text-void-400 max-w-sm mb-6">
            Explore videos and click the bookmark icon to create your personal offline playlist.
          </p>
          <button
            onClick={navigateToHome}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-neon-purple hover:bg-purple-600 text-white text-xs font-semibold shadow-neon-purple transition-all"
          >
            Explore Trending
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {currentList.map((video, idx) => (
            <VideoCard
              key={(video.videoId || video.id || '') + idx}
              video={video}
            />
          ))}
        </div>
      )}
    </div>
  );
}
