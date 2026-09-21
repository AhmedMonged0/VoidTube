import React from 'react';
import { Home, UtensilsCrossed, Bookmark, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav() {
  const { nav, navigateToHome, watchLater, setIsWatchLaterOpen, setSelectedCategory, navigateToSearch } = useApp();

  const isHome = nav.page === 'home';
  const isCooking = nav.page === 'home' && nav.category === 'cooking';
  const isSearch = nav.page === 'search';

  const handleCookingClick = () => {
    navigateToHome();
    if (typeof setSelectedCategory === 'function') {
      setSelectedCategory('cooking');
    }
  };

  const handleSearchClick = () => {
    // Scroll to top or trigger search
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const searchBtn = document.querySelector('header button[title="بحث"]');
    if (searchBtn) {
      searchBtn.click();
    } else {
      navigateToSearch('');
    }
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0b10]/95 backdrop-blur-2xl border-t border-white/[0.08] px-2 py-1.5 pb-safe transition-transform duration-300 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
      dir="rtl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Home Tab */}
        <button
          onClick={navigateToHome}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            isHome && !isCooking
              ? 'text-neon-purple'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isHome && !isCooking ? 'bg-neon-purple/15' : ''}`}>
            <Home size={20} className={isHome && !isCooking ? 'text-neon-purple fill-neon-purple/20' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">الرئيسية</span>
        </button>

        {/* 2. Cooking Quick Tab */}
        <button
          onClick={handleCookingClick}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            isCooking
              ? 'text-neon-purple'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isCooking ? 'bg-neon-purple/15' : ''}`}>
            <UtensilsCrossed size={20} className={isCooking ? 'text-neon-purple fill-neon-purple/20' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">طبخ وأكلات</span>
        </button>

        {/* 3. Search Tab */}
        <button
          onClick={handleSearchClick}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 ${
            isSearch
              ? 'text-neon-purple'
              : 'text-void-400 hover:text-void-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${isSearch ? 'bg-neon-purple/15' : ''}`}>
            <Search size={20} className={isSearch ? 'text-neon-purple' : ''} />
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">بحث</span>
        </button>

        {/* 4. Watch Later Tab */}
        <button
          onClick={() => setIsWatchLaterOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-void-400 hover:text-void-200 transition-all duration-200 relative"
        >
          <div className="p-1 rounded-xl relative">
            <Bookmark size={20} />
            {watchLater.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 rounded-full bg-neon-purple text-[9px] font-black text-white items-center justify-center shadow-neon-purple animate-pulse">
                {watchLater.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">المشاهدة لاحقاً</span>
        </button>

      </div>
    </nav>
  );
}
