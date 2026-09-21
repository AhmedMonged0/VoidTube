import React, { useState, useRef, useEffect } from 'react';
import { Play, Bookmark, Server, Compass, Globe2, ChevronDown } from 'lucide-react';
import { useApp, REGIONS } from '../context/AppContext';
import SearchBar from './SearchBar';
import { INVIDIOUS_INSTANCES } from '../services/instances';

export default function Header() {
  const {
    nav,
    navigateToHome,
    watchLater,
    setIsWatchLaterOpen,
    setIsInstanceModalOpen,
    activeInstance,
    region,
    setRegion
  } = useApp();

  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const regionMenuRef = useRef(null);

  const currentInstanceMeta = INVIDIOUS_INSTANCES.find(i => i.url === activeInstance) || {
    name: new URL(activeInstance || 'https://invidious.io').hostname.replace('www.', ''),
    flag: '🌐'
  };

  const currentRegionMeta = REGIONS.find(r => r.code === region) || REGIONS[0];

  // Close region menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (regionMenuRef.current && !regionMenuRef.current.contains(e.target)) {
        setShowRegionMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/85 backdrop-blur-xl border-b border-white/[0.06] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
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
            استكشف
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl px-1 sm:px-2">
          <SearchBar />
        </div>

        {/* Right Actions: Region Selector, Instance & Bookmarks */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Region Selector (Default: Egypt 🇪🇬) */}
          <div ref={regionMenuRef} className="relative">
            <button
              onClick={() => setShowRegionMenu(!showRegionMenu)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1a1a24] border border-white/10 text-xs text-void-200 hover:text-white transition-all shadow-sm"
              title="تغيير المنطقة والمحتوى"
            >
              <span className="text-sm">{currentRegionMeta.flag}</span>
              <span className="font-medium text-[11px] hidden sm:inline">{currentRegionMeta.name}</span>
              <ChevronDown size={12} className="text-void-500" />
            </button>

            {/* Region Dropdown */}
            {showRegionMenu && (
              <div className="absolute right-0 top-full mt-2 w-44 py-1.5 bg-[#14141c] border border-white/10 rounded-xl shadow-2xl z-50 animate-fade-in">
                <div className="px-3 py-1 text-[10px] font-semibold text-void-500 border-b border-white/5 uppercase tracking-wider">
                  منطقة المحتوى
                </div>
                {REGIONS.map((r) => (
                  <button
                    key={r.code}
                    onClick={() => {
                      setRegion(r.code);
                      setShowRegionMenu(false);
                      navigateToHome();
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
                      region === r.code ? 'text-neon-purple font-bold bg-neon-purple/10' : 'text-void-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{r.flag}</span>
                      <span>{r.name}</span>
                    </span>
                    {region === r.code && (
                      <span className="w-1.5 h-1.5 rounded-full bg-neon-purple shadow-neon-purple" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Install App Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('voidtube-open-install-guide'));
            }}
            title="تثبيت التطبيق على الموبايل"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-neon-purple/15 hover:bg-neon-purple/25 border border-neon-purple/30 text-xs text-neon-purple hover:text-white transition-all shadow-sm"
          >
            <span className="text-xs">📱</span>
            <span className="font-semibold text-[11px] hidden md:inline">تثبيت التطبيق</span>
          </button>

          {/* Active Instance Button */}
          <button
            onClick={() => setIsInstanceModalOpen(true)}
            title="حالة خادم Invidious والتبديل"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1c1c24] border border-white/5 text-xs text-void-300 hover:text-void-100 transition-all duration-150"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[11px] truncate max-w-[85px]">
              {currentInstanceMeta.name}
            </span>
            <Server size={13} className="text-void-500" />
          </button>

          {/* Watch Later / Bookmarks Button */}
          <button
            onClick={() => setIsWatchLaterOpen(true)}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1a1a24] border border-white/10 text-void-200 hover:text-white transition-all duration-150 group"
            title="قائمة المشاهدة لاحقاً"
          >
            <Bookmark
              size={16}
              className={`transition-colors ${
                watchLater.length > 0 ? 'text-neon-purple fill-neon-purple/30' : 'text-void-400 group-hover:text-void-200'
              }`}
            />
            <span className="hidden md:inline text-xs font-semibold">
              المشاهدة لاحقاً
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
