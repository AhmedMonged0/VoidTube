import React, { useState, useRef, useEffect } from 'react';
import { Play, Bookmark, Server, Compass, ChevronDown, Search, ArrowRight, X, Smartphone } from 'lucide-react';
import { useApp, REGIONS } from '../context/AppContext';
import SearchBar from './SearchBar';
import { INVIDIOUS_INSTANCES } from '../services/instances';

export default function Header({ onOpenApkModal }) {
  const {
    nav,
    navigateToHome,
    watchLater,
    setIsWatchLaterOpen,
    setIsInstanceModalOpen,
    activeInstance,
    region,
    setRegion,
    navigateToSearch
  } = useApp();

  const [showRegionMenu, setShowRegionMenu] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState(nav.query || '');
  const regionMenuRef = useRef(null);
  const mobileInputRef = useRef(null);

  const currentInstanceMeta = INVIDIOUS_INSTANCES.find(i => i.url === activeInstance) || {
    name: new URL(activeInstance || 'https://invidious.io').hostname.replace('www.', ''),
    flag: '🌐'
  };

  const currentRegionMeta = REGIONS.find(r => r.code === region) || REGIONS[0];

  // Focus mobile input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen) {
      setTimeout(() => mobileInputRef.current?.focus(), 50);
    }
  }, [mobileSearchOpen]);

  // Keep mobile query synced
  useEffect(() => {
    if (nav.page === 'search') {
      setMobileQuery(nav.query || '');
    }
  }, [nav.page, nav.query]);

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

  const handleMobileSearchSubmit = (e) => {
    e.preventDefault();
    if (mobileQuery.trim()) {
      setMobileSearchOpen(false);
      navigateToSearch(mobileQuery.trim());
    }
  };

  const triggerApkModal = () => {
    if (onOpenApkModal) {
      onOpenApkModal();
    } else {
      window.dispatchEvent(new CustomEvent('voidtube-open-apk-modal'));
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/[0.06] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* =========================================
            MOBILE SEARCH BAR OVERLAY (When activated)
           ========================================= */}
        {mobileSearchOpen ? (
          <form 
            onSubmit={handleMobileSearchSubmit} 
            className="flex md:hidden items-center w-full gap-2 animate-fade-in"
            dir="rtl"
          >
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 rounded-full text-void-400 hover:text-white bg-white/5 active:scale-95"
              title="رجوع"
            >
              <ArrowRight size={18} />
            </button>

            <div className="relative flex-1 flex items-center">
              <input
                ref={mobileInputRef}
                type="text"
                value={mobileQuery}
                onChange={(e) => setMobileQuery(e.target.value)}
                placeholder="ابحث في فيديوهات مصر والعالم..."
                className="w-full bg-[#161620] text-white text-xs sm:text-sm rounded-full pl-9 pr-4 py-2 border border-neon-purple/40 focus:outline-none focus:ring-1 focus:ring-neon-purple"
              />
              {mobileQuery && (
                <button
                  type="button"
                  onClick={() => { setMobileQuery(''); mobileInputRef.current?.focus(); }}
                  className="absolute left-2.5 p-1 text-void-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={!mobileQuery.trim()}
              className="px-3.5 py-2 bg-neon-purple text-white text-xs font-bold rounded-full disabled:opacity-40 shrink-0 shadow-neon-purple"
            >
              بحث
            </button>
          </form>
        ) : (
          /* =========================================
             STANDARD HEADER (Desktop & Mobile Normal)
             ========================================= */
          <>
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              <button
                onClick={navigateToHome}
                className="flex items-center gap-2 group text-left focus:outline-none"
              >
                {/* Glowing Void Icon */}
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-950 via-[#161426] to-[#251b3d] p-[1px] shadow-neon-purple group-hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all duration-300">
                  <div className="w-full h-full bg-[#0d0d12] rounded-[11px] flex items-center justify-center">
                    <Play size={15} className="text-neon-purple fill-neon-purple ml-0.5 group-hover:scale-110 transition-transform duration-200" />
                  </div>
                </div>

                {/* Typography */}
                <div className="flex flex-col">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-void-100 to-purple-300 bg-clip-text text-transparent flex items-center gap-1.5">
                    VoidTube
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-neon-purple/15 text-neon-purple border border-neon-purple/30 tracking-wider">
                      Void
                    </span>
                  </span>
                </div>
              </button>

              {/* Desktop Explore Nav pill */}
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

            {/* Center: Search Bar (Desktop only, responsive max-w) */}
            <div className="hidden md:flex flex-1 max-w-xl px-2">
              <SearchBar />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Mobile Search Toggle Button */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden p-2 rounded-full bg-[#141419] border border-white/10 text-void-300 hover:text-white transition-all"
                title="بحث"
              >
                <Search size={16} />
              </button>

              {/* Region Selector (Compact Flag) */}
              <div ref={regionMenuRef} className="relative">
                <button
                  onClick={() => setShowRegionMenu(!showRegionMenu)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1a1a24] border border-white/10 text-xs text-void-200 hover:text-white transition-all shadow-sm"
                  title="تغيير الدولة والمحتوى"
                >
                  <span className="text-sm">{currentRegionMeta.flag}</span>
                  <span className="font-medium text-[11px] hidden sm:inline">{currentRegionMeta.name}</span>
                  <ChevronDown size={11} className="text-void-500 hidden sm:inline" />
                </button>

                {/* Region Dropdown */}
                {showRegionMenu && (
                  <div className="absolute right-0 top-full mt-2 w-44 py-1.5 bg-[#14141c] border border-white/10 rounded-xl shadow-2xl z-50 animate-fade-in" dir="rtl">
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
                        className={`w-full text-right px-3 py-2 text-xs flex items-center justify-between hover:bg-white/10 transition-colors ${
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

              {/* Direct APK Download Button (Visible Desktop & Mobile Header) */}
              <button
                onClick={triggerApkModal}
                title="تحميل تطبيق VoidTube للأندرويد (ملف APK)"
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-neon-purple/20 hover:from-emerald-500/25 hover:to-neon-purple/30 border border-emerald-500/30 text-xs text-emerald-400 hover:text-white transition-all shadow-sm group"
              >
                <Smartphone size={13} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-[10px] sm:text-[11px]">تحميل APK</span>
              </button>

              {/* Desktop Active Invidious Server Instance Button */}
              <button
                onClick={() => setIsInstanceModalOpen(true)}
                title="حالة خادم Invidious والتبديل"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1c1c24] border border-white/5 text-xs text-void-300 hover:text-void-100 transition-all duration-150"
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

              {/* Watch Later / Bookmarks Button (Desktop & Mobile) */}
              <button
                onClick={() => setIsWatchLaterOpen(true)}
                className="relative flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1a1a24] border border-white/10 text-void-200 hover:text-white transition-all duration-150 group"
                title="قائمة المشاهدة لاحقاً"
              >
                <Bookmark
                  size={15}
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
          </>
        )}

      </div>
    </header>
  );
}
