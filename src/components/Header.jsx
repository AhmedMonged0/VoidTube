import React, { useState, useRef, useEffect } from 'react';
import { Play, Bookmark, Search, ArrowRight, X, Smartphone, Download, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchBar from './SearchBar';

export default function Header({ onOpenApkModal }) {
  const {
    nav,
    navigateToHome,
    watchLater,
    setIsWatchLaterOpen,
    downloads,
    setIsDownloadsOpen,
    navigateToSearch,
    toggleSidebar
  } = useApp();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState(nav.query || '');
  const mobileInputRef = useRef(null);

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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6">
        
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
            {/* Left: Hamburger Menu & Brand Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <button
                onClick={toggleSidebar}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.04] hover:bg-neon-purple/20 text-void-300 hover:text-neon-purple border border-white/5 hover:border-neon-purple/30 transition-all active:scale-95 flex items-center gap-1.5"
                title="مركز الإعدادات والتحكم"
              >
                <SlidersHorizontal size={17} />
                <span className="hidden sm:inline text-xs font-bold">الإعدادات</span>
              </button>

              <button
                onClick={navigateToHome}
                className="flex items-center gap-2 sm:gap-2.5 group text-left focus:outline-none"
              >
                {/* Glowing Void Brand Logo */}
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-[#08080c] border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.35)] group-hover:shadow-[0_0_25px_rgba(168,85,247,0.7)] group-hover:scale-105 transition-all duration-300">
                  <img src="/logo.png" alt="VoidTube Logo" className="w-full h-full object-cover" />
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
            </div>

            {/* Center: Search Bar (Desktop only, responsive max-w) */}
            <div className="hidden md:flex flex-1 max-w-xl px-4">
              <SearchBar />
            </div>

            {/* Right Actions: Clean & Focused */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Mobile Search Toggle Button */}
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="md:hidden p-2 rounded-full bg-[#141419] border border-white/10 text-void-300 hover:text-white transition-all"
                title="بحث"
              >
                <Search size={16} />
              </button>

              {/* Direct APK Download Button (Desktop only - for users downloading APK to their phone) */}
              <button
                onClick={triggerApkModal}
                title="تحميل تطبيق VoidTube للأندرويد (ملف APK)"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-neon-purple/20 hover:from-emerald-500/25 hover:to-neon-purple/30 border border-emerald-500/30 text-xs text-emerald-400 hover:text-white transition-all shadow-sm group"
              >
                <Smartphone size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-[11px]">تحميل APK</span>
              </button>

              {/* Downloads Button (Desktop & Tablet) */}
              <button
                onClick={() => setIsDownloadsOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1a1a24] border border-white/10 text-void-200 hover:text-white transition-all duration-150 group"
                title="التنزيلات المحفوظة"
              >
                <Download
                  size={15}
                  className={`transition-colors ${
                    downloads && downloads.length > 0 ? 'text-emerald-400' : 'text-void-400 group-hover:text-emerald-400'
                  }`}
                />
                <span className="hidden sm:inline text-xs font-semibold">
                  التنزيلات
                </span>
                {downloads && downloads.length > 0 && (
                  <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                    {downloads.length}
                  </span>
                )}
              </button>

              {/* Watch Later / Bookmarks Button */}
              <button
                onClick={() => setIsWatchLaterOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1a1a24] border border-white/10 text-void-200 hover:text-white transition-all duration-150 group"
                title="قائمة المشاهدة لاحقاً"
              >
                <Bookmark
                  size={15}
                  className={`transition-colors ${
                    watchLater.length > 0 ? 'text-neon-purple fill-neon-purple/30' : 'text-void-400 group-hover:text-void-200'
                  }`}
                />
                <span className="hidden sm:inline text-xs font-semibold">
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
