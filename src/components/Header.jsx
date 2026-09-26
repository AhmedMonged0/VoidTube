import React from 'react';
import { 
  Play, 
  Bookmark, 
  Search, 
  Smartphone, 
  Download, 
  SlidersHorizontal,
  Compass,
  Headphones,
  Home,
  BookOpen,
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import SearchBar from './SearchBar';

export default function Header({ onOpenApkModal }) {
  const {
    nav,
    navigateToHome,
    navigateToExplore,
    navigateToAudio,
    navigateToLibrary,
    navigateToSettings,
    downloads,
    watchLater,
    setIsDownloadsOpen,
    setIsWatchLaterOpen,
    toggleSidebar,
    setIsMobileSearchOpen,
  } = useApp();

  const triggerApkModal = () => {
    if (onOpenApkModal) {
      onOpenApkModal();
    } else {
      window.dispatchEvent(new CustomEvent('voidtube-open-apk-modal'));
    }
  };

  const isHome = nav.page === 'home';
  const isExplore = nav.page === 'explore';
  const isAudio = nav.page === 'audio';
  const isLibrary = nav.page === 'library';
  const isSettings = nav.page === 'settings';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0a0c]/90 backdrop-blur-xl border-b border-white/[0.06] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6">
        
        {/* Left: Hamburger Menu & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <button
            onClick={navigateToSettings}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 ${
              isSettings
                ? 'bg-neon-purple text-white shadow-neon-purple border border-neon-purple'
                : 'bg-white/[0.04] hover:bg-neon-purple/20 text-void-300 hover:text-neon-purple border border-white/5 hover:border-neon-purple/30'
            }`}
            title="الإعدادات والتحكم"
          >
            <Settings size={16} className={isSettings ? 'animate-spin-slow' : ''} />
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

        {/* Center: Desktop Navigation Hub Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-2xl border border-white/[0.05]">
          <button
            onClick={navigateToHome}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isHome
                ? 'bg-neon-purple text-white shadow-neon-purple'
                : 'text-void-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Home size={14} />
            <span>الرئيسية</span>
          </button>

          <button
            onClick={navigateToExplore}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isExplore
                ? 'bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                : 'text-void-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Compass size={14} />
            <span>استكشاف</span>
          </button>

          <button
            onClick={navigateToAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isAudio
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.5)]'
                : 'text-void-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Headphones size={14} className={isAudio ? 'animate-pulse' : ''} />
            <span>صوت وتركيز</span>
          </button>

          <button
            onClick={navigateToLibrary}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isLibrary
                ? 'bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'text-void-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen size={14} />
            <span>المكتبة</span>
          </button>
        </nav>

        {/* Center-Right: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm xl:max-w-md px-2">
          <SearchBar />
        </div>

        {/* Right Actions: Mobile search, APK, Downloads, Library */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden p-2 rounded-full bg-[#141419] border border-white/10 text-void-300 hover:text-white transition-all"
            title="بحث"
          >
            <Search size={16} />
          </button>

          {/* Direct Mobile App Download Button (Android & iPhone) */}
          <button
            onClick={triggerApkModal}
            title="تحميل تطبيق VoidTube للهاتف (أندرويد APK وآيفون IPA)"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-neon-purple/15 to-purple-600/20 hover:from-emerald-500/25 hover:to-neon-purple/30 border border-emerald-500/30 text-xs text-white transition-all shadow-sm group"
          >
            <Smartphone size={14} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-[11px] text-emerald-400 group-hover:text-white">تطبيق الهاتف (APK / IPA)</span>
          </button>

          {/* Quick Library / Downloads Button */}
          <button
            onClick={navigateToLibrary}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141419] hover:bg-[#1a1a24] border border-white/10 text-void-200 hover:text-white transition-all duration-150 group"
            title="المكتبة والتنزيلات"
          >
            <Download
              size={15}
              className={`transition-colors ${
                downloads && downloads.length > 0 ? 'text-emerald-400' : 'text-void-400 group-hover:text-emerald-400'
              }`}
            />
            <span className="hidden xl:inline text-xs font-semibold">
              المكتبة
            </span>
            {downloads && downloads.length > 0 && (
              <span className="flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-sm">
                {downloads.length}
              </span>
            )}
          </button>



        </div>

      </div>
    </header>
  );
}
