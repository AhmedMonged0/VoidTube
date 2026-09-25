import React from 'react';
import { Home, Bookmark, Search, Download, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav() {
  const { 
    nav, 
    navigateToHome, 
    watchLater, 
    setIsWatchLaterOpen, 
    navigateToSearch,
    downloads,
    setIsDownloadsOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsMobileSearchOpen
  } = useApp();

  const isHome = nav.page === 'home';
  const isSearch = nav.page === 'search';

  const handleSearchClick = () => {
    setIsMobileSearchOpen(true);
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0b10]/95 backdrop-blur-2xl border-t border-white/[0.08] px-1 py-1.5 pb-safe transition-transform duration-300 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
      dir="rtl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Home Tab */}
        <button
          onClick={navigateToHome}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
            isHome
              ? 'text-neon-purple'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isHome ? 'bg-neon-purple/15' : ''}`}>
            <Home size={19} className={isHome ? 'text-neon-purple fill-neon-purple/20' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">الرئيسية</span>
        </button>

        {/* 2. Search Tab */}
        <button
          onClick={handleSearchClick}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
            isSearch
              ? 'text-neon-purple'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isSearch ? 'bg-neon-purple/15' : ''}`}>
            <Search size={19} className={isSearch ? 'text-neon-purple' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">بحث</span>
        </button>

        {/* 3. Downloads Tab */}
        <button
          onClick={() => setIsDownloadsOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-void-400 hover:text-emerald-400 transition-all duration-200 relative group"
        >
          <div className="p-1 rounded-xl relative">
            <Download size={19} className="group-hover:text-emerald-400 transition-colors" />
            {downloads && downloads.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 px-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white items-center justify-center shadow-sm">
                {downloads.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight group-hover:text-emerald-400">التنزيلات</span>
        </button>

        {/* 4. Watch Later Tab */}
        <button
          onClick={() => setIsWatchLaterOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-void-400 hover:text-void-200 transition-all duration-200 relative"
        >
          <div className="p-1 rounded-xl relative">
            <Bookmark size={19} />
            {watchLater && watchLater.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 px-0.5 rounded-full bg-neon-purple text-[8px] font-black text-white items-center justify-center shadow-neon-purple animate-pulse">
                {watchLater.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">لاحقاً</span>
        </button>

        {/* 5. Settings Hub Tab */}
        <button
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
            isSidebarOpen
              ? 'text-neon-purple'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isSidebarOpen ? 'bg-neon-purple/15' : ''}`}>
            <Settings size={19} className={isSidebarOpen ? 'text-neon-purple animate-spin-slow' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">الإعدادات</span>
        </button>

      </div>
    </nav>
  );
}
