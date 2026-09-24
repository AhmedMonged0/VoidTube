import React from 'react';
import { Bookmark, X, Flame, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ARABIC_CATEGORIES } from './CategoryPills';

export default function Sidebar() {
  const {
    nav,
    navigateToHome,
    selectedCategory,
    setSelectedCategory,
    isSidebarOpen,
    setIsSidebarOpen,
    watchLater,
    setIsWatchLaterOpen,
    downloads,
    setIsDownloadsOpen
  } = useApp();

  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    if (nav.page !== 'home') {
      navigateToHome();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleWatchLaterClick = () => {
    setIsWatchLaterOpen(true);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handleDownloadsClick = () => {
    setIsDownloadsOpen(true);
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* =========================================================
          1. DESKTOP SIDEBAR (Only visible when isSidebarOpen is true)
         ========================================================= */}
      {nav.page !== 'watch' && isSidebarOpen && (
        <aside 
          className="hidden lg:flex flex-col shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar py-2 transition-all duration-300 w-56 pr-2 animate-fade-in"
          dir="rtl"
        >
          <div className="flex flex-col space-y-1 w-full">
            {ARABIC_CATEGORIES.map((cat) => {
              const isActive = nav.page === 'home' && selectedCategory === cat.id;
              const Icon = cat.icon || Flame;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  title={cat.label}
                  className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 group w-full text-right ${
                    isActive
                      ? 'bg-neon-purple/20 text-white font-bold border border-neon-purple/40 shadow-neon-purple'
                      : 'text-void-300 hover:text-white hover:bg-white/[0.06] font-medium'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl transition-all ${
                    isActive ? 'bg-neon-purple text-white' : 'text-void-400 group-hover:text-neon-purple'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className="truncate tracking-tight">{cat.label}</span>
                </button>
              );
            })}

            <div className="border-t border-white/[0.08] my-3 pt-2" />

            {/* Offline Downloads Quick Access */}
            <button
              onClick={handleDownloadsClick}
              title="التنزيلات والفيديوهات المحفوظة"
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 group w-full text-right text-void-300 hover:text-white hover:bg-white/[0.06] font-medium"
            >
              <div className="p-1.5 rounded-xl text-void-400 group-hover:text-emerald-400">
                <Download size={18} />
              </div>
              <div className="flex items-center justify-between flex-1 truncate">
                <span className="truncate">التنزيلات المحفوظة</span>
                {downloads && downloads.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    {downloads.length}
                  </span>
                )}
              </div>
            </button>

            {/* Watch Later Quick Access */}
            <button
              onClick={handleWatchLaterClick}
              title="المشاهدة لاحقاً"
              className="flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs transition-all duration-200 group w-full text-right text-void-300 hover:text-white hover:bg-white/[0.06] font-medium"
            >
              <div className="p-1.5 rounded-xl text-void-400 group-hover:text-neon-purple">
                <Bookmark size={18} />
              </div>
              <div className="flex items-center justify-between flex-1 truncate">
                <span className="truncate">المشاهدة لاحقاً</span>
                {watchLater && watchLater.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30 text-[10px] font-bold">
                    {watchLater.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </aside>
      )}

      {/* =========================================================
          2. MOBILE DRAWER OVERLAY (Slide-over side menu)
         ========================================================= */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end animate-fade-in" dir="rtl">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer Menu */}
          <div className="relative w-72 max-w-[80vw] h-full bg-[#101016] border-l border-white/10 p-4 shadow-2xl flex flex-col z-10 animate-slide-left overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neon-purple/20 flex items-center justify-center text-neon-purple">
                  <Flame size={18} />
                </div>
                <span className="font-extrabold text-base text-white">قائمة الأقسام</span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-full text-void-400 hover:text-white hover:bg-white/10 transition-colors"
                title="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Categories List */}
            <div className="flex flex-col space-y-1.5 flex-1">
              {ARABIC_CATEGORIES.map((cat) => {
                const isActive = nav.page === 'home' && selectedCategory === cat.id;
                const Icon = cat.icon || Flame;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs transition-all w-full text-right ${
                      isActive
                        ? 'bg-neon-purple text-white font-bold shadow-neon-purple'
                        : 'text-void-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-neon-purple'} />
                    <span className="font-medium text-sm">{cat.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-white/10 my-3 pt-2" />

              {/* Downloads in Mobile Drawer */}
              <button
                onClick={handleDownloadsClick}
                className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs text-void-200 hover:bg-white/5 w-full text-right"
              >
                <div className="flex items-center gap-3">
                  <Download size={18} className="text-emerald-400" />
                  <span className="font-medium text-sm">التنزيلات المحفوظة</span>
                </div>
                {downloads && downloads.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30">
                    {downloads.length}
                  </span>
                )}
              </button>

              {/* Watch Later in Mobile Drawer */}
              <button
                onClick={handleWatchLaterClick}
                className="flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs text-void-200 hover:bg-white/5 w-full text-right"
              >
                <div className="flex items-center gap-3">
                  <Bookmark size={18} className="text-neon-purple" />
                  <span className="font-medium text-sm">المشاهدة لاحقاً</span>
                </div>
                {watchLater && watchLater.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-neon-purple text-white font-bold text-xs">
                    {watchLater.length}
                  </span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
