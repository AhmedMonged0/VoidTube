import React from 'react';
import { Home, Compass, Headphones, BookOpen, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav() {
  const { 
    nav, 
    navigateToHome, 
    navigateToExplore,
    navigateToAudio,
    navigateToLibrary,
    downloads,
    watchLater,
    setIsMobileSearchOpen
  } = useApp();

  const isHome = nav.page === 'home';
  const isExplore = nav.page === 'explore';
  const isAudio = nav.page === 'audio';
  const isLibrary = nav.page === 'library';

  const totalLibraryItems = (downloads?.length || 0) + (watchLater?.length || 0);

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0b10]/95 backdrop-blur-2xl border-t border-white/[0.08] px-1 py-1.5 pb-safe transition-transform duration-300 shadow-[0_-8px_25px_rgba(0,0,0,0.8)]"
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
          <div className={`p-1 rounded-xl transition-all ${isHome ? 'bg-neon-purple/15 shadow-sm' : ''}`}>
            <Home size={19} className={isHome ? 'text-neon-purple fill-neon-purple/20' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">الرئيسية</span>
        </button>

        {/* 2. Explore Tab */}
        <button
          onClick={navigateToExplore}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
            isExplore
              ? 'text-cyan-400'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isExplore ? 'bg-cyan-500/15 shadow-sm' : ''}`}>
            <Compass size={19} className={isExplore ? 'text-cyan-400 animate-spin-slow' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">استكشاف</span>
        </button>

        {/* 3. Audio & Focus Vinyl Tab */}
        <button
          onClick={navigateToAudio}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 ${
            isAudio
              ? 'text-pink-400'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isAudio ? 'bg-pink-500/15 shadow-sm' : ''}`}>
            <Headphones size={19} className={isAudio ? 'text-pink-400 animate-pulse' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">صوت وتركيز</span>
        </button>

        {/* 4. Library Tab */}
        <button
          onClick={navigateToLibrary}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 relative ${
            isLibrary
              ? 'text-emerald-400'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all relative ${isLibrary ? 'bg-emerald-500/15 shadow-sm' : ''}`}>
            <BookOpen size={19} className={isLibrary ? 'text-emerald-400' : ''} />
            {totalLibraryItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 px-0.5 rounded-full bg-emerald-500 text-[8px] font-black text-white items-center justify-center shadow-sm">
                {totalLibraryItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">المكتبة</span>
        </button>

        {/* 5. Search Overlay Trigger */}
        <button
          onClick={() => setIsMobileSearchOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl text-void-400 hover:text-void-200 transition-all duration-200"
        >
          <div className="p-1 rounded-xl">
            <Search size={19} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">بحث</span>
        </button>

      </div>
    </nav>
  );
}
