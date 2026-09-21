import React from 'react';
import { Play, Bookmark, Server, Sparkles, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchBar from './SearchBar';
import { INVIDIOUS_INSTANCES } from '../services/instances';

export default function Header() {
  const {
    nav,
    navigateToHome,
    navigateToBookmarks,
    watchLater,
    setIsWatchLaterOpen,
    setIsInstanceModalOpen,
    activeInstance
  } = useApp();

  const currentInstanceMeta = INVIDIOUS_INSTANCES.find(i => i.url === activeInstance) || {
    name: new URL(activeInstance || 'https://invidious.io').hostname.replace('www.', ''),
    flag: '🌐'
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/85 backdrop-blur-xl border-b border-white/[0.06] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <button
            onClick={navigateToHome}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            {/* Glowing Void Icon */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-950 via-[#161426] to-[#251b3d] p-[1px] shadow-neon-purple group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-300">
              <div className="w-full h-full bg-[#0d0d12] rounded-[11px] flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-neon-purple/20 animate-ping absolute" />
                  <Play size={16} className="text-neon-purple fill-neon-purple group-hover:scale-110 transition-transform duration-200 ml-0.5" />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-void-100 to-purple-300 bg-clip-text text-transparent flex items-center gap-1.5">
                VoidTube
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-neon-purple/15 text-neon-purple border border-neon-purple/30 tracking-wider">
                  Void
                </span>
              </span>
            </div>
          </button>

          {/* Explore Nav pill */}
          <button
            onClick={navigateToHome}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              nav.page === 'home'
                ? 'bg-white/10 text-white border border-white/15'
                : 'text-void-400 hover:text-void-100 hover:bg-white/5'
            }`}
          >
            <Compass size={14} className={nav.page === 'home' ? 'text-neon-purple' : ''} />
            Explore
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-2xl px-2">
          <SearchBar />
        </div>

        {/* Right Actions: Instance & Bookmarks */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Active Instance Button */}
          <button
            onClick={() => setIsInstanceModalOpen(true)}
            title="Invidious Instance status & switcher"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1c1c24] border border-white/5 text-xs text-void-300 hover:text-void-100 transition-all duration-150"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[11px] truncate max-w-[100px]">
              {currentInstanceMeta.name}
            </span>
            <Server size={13} className="text-void-500" />
          </button>

          {/* Watch Later / Bookmarks Button */}
          <button
            onClick={() => setIsWatchLaterOpen(true)}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1a1a24] border border-white/10 text-void-200 hover:text-white transition-all duration-150 group"
            title="Watch Later list"
          >
            <Bookmark
              size={16}
              className={`transition-colors ${
                watchLater.length > 0 ? 'text-neon-purple fill-neon-purple/30' : 'text-void-400 group-hover:text-void-200'
              }`}
            />
            <span className="hidden md:inline text-xs font-semibold">
              Watch Later
            </span>
            {watchLater.length > 0 && (
              <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-neon-purple text-[10px] font-bold text-white shadow-glow-sm">
                {watchLater.length}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
