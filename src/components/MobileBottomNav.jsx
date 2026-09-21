import React from 'react';
import { Home, UtensilsCrossed, Bookmark, Smartphone, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MobileBottomNav({ onOpenApkModal }) {
  const { nav, navigateToHome, watchLater, setIsWatchLaterOpen, setSelectedCategory } = useApp();

  const isHome = nav.page === 'home';
  const isCooking = nav.page === 'home' && nav.category === 'cooking';

  const handleCookingClick = () => {
    navigateToHome();
    if (typeof setSelectedCategory === 'function') {
      setSelectedCategory('cooking');
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

        {/* 3. Watch Later Tab */}
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

        {/* 4. APK Download Tab (Special Glowing Action) */}
        <button
          onClick={onOpenApkModal}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-emerald-400 hover:text-emerald-300 transition-all duration-200 group"
        >
          <div className="p-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:scale-105 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <Smartphone size={20} className="text-emerald-400" />
          </div>
          <span className="text-[10px] font-black mt-0.5 text-emerald-400 flex items-center gap-0.5 tracking-tight">
            تحميل APK
          </span>
        </button>

      </div>
    </nav>
  );
}
