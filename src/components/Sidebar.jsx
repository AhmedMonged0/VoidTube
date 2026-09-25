import React, { useState } from 'react';
import { 
  Settings, 
  Server, 
  Globe, 
  Sliders, 
  Trash2, 
  Download, 
  Bookmark, 
  RefreshCw, 
  Zap, 
  Wifi, 
  PlayCircle, 
  X, 
  Sparkles, 
  Smartphone,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useApp, REGIONS } from '../context/AppContext';

export default function Sidebar() {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    activeInstance,
    setIsInstanceModalOpen,
    region,
    setRegion,
    defaultQuality,
    setDefaultQuality,
    dataSaver,
    toggleDataSaver,
    autoplayNext,
    toggleAutoplayNext,
    history,
    clearHistory,
    recentSearches,
    clearRecentSearches,
    clearAppCache,
    downloads,
    setIsDownloadsOpen,
    watchLater,
    setIsWatchLaterOpen,
    checkForUpdates,
    CURRENT_APP_VERSION,
  } = useApp();

  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleManualCheckUpdate = async () => {
    setCheckingUpdate(true);
    await checkForUpdates(true);
    setTimeout(() => setCheckingUpdate(false), 1200);
  };

  const handleRegionChange = (newRegion) => {
    setRegion(newRegion);
  };

  const qualityOptions = ['auto', '1080p', '720p', '480p', '360p'];

  const renderContent = () => (
    <div className="flex flex-col gap-5 p-4 text-right" dir="rtl">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-neon-purple/30 to-purple-600/20 border border-neon-purple/40 flex items-center justify-center text-neon-purple shadow-[0_0_15px_rgba(139,92,246,0.25)]">
            <Settings size={18} className="animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
              الإعدادات والتحكم
              <span className="text-[10px] font-bold text-neon-purple bg-neon-purple/15 px-1.5 py-0.2 rounded-full border border-neon-purple/30">
                Hub
              </span>
            </h2>
            <p className="text-[10px] text-void-400">تخصيص السيرفر، الجودة، والمحتوى</p>
          </div>
        </div>

        {/* Close Button on Mobile / Desktop */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="p-1.5 rounded-xl text-void-400 hover:text-white hover:bg-white/10 transition-colors active:scale-95"
          title="إغلاق القائمة"
        >
          <X size={18} />
        </button>
      </div>

      {/* 2. Streaming Server (Invidious Instance) */}
      <div className="rounded-2xl bg-[#14141d] border border-white/[0.06] p-3 flex flex-col gap-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Server size={14} className="text-neon-purple" />
            سيرفر البث النشط
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            سريع وآمن
          </span>
        </div>

        <div className="flex items-center justify-between bg-black/30 px-2.5 py-2 rounded-xl border border-white/[0.04]">
          <span className="text-[11px] font-mono text-void-300 truncate max-w-[160px]">
            {activeInstance ? activeInstance.replace('https://', '') : 'invidious.f5.si'}
          </span>
          <button
            onClick={() => {
              setIsInstanceModalOpen(true);
              if (window.innerWidth < 1024) setIsSidebarOpen(false);
            }}
            className="text-[11px] font-bold text-neon-purple hover:text-purple-300 transition-colors"
          >
            تبديل السيرفر ⇄
          </button>
        </div>
      </div>

      {/* 3. Trending Region Selector */}
      <div className="rounded-2xl bg-[#14141d] border border-white/[0.06] p-3 flex flex-col gap-2.5 shadow-sm">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Globe size={14} className="text-neon-purple" />
          منطقة المحتوى والتريند
        </span>

        <div className="grid grid-cols-2 gap-1.5">
          {REGIONS.map((r) => {
            const isSelected = region === r.code;
            return (
              <button
                key={r.code}
                onClick={() => handleRegionChange(r.code)}
                className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-neon-purple text-white border-neon-purple shadow-neon-purple'
                    : 'bg-black/30 hover:bg-white/[0.06] text-void-300 hover:text-white border-white/[0.04]'
                }`}
              >
                <span className="text-sm">{r.flag}</span>
                <span className="truncate">{r.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Playback Quality & Data Preferences */}
      <div className="rounded-2xl bg-[#14141d] border border-white/[0.06] p-3 flex flex-col gap-3 shadow-sm">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Sliders size={14} className="text-neon-purple" />
          إعدادات التشغيل والجودة
        </span>

        {/* Quality Selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-void-400">الجودة الافتراضية للفيديوهات:</span>
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.04] overflow-x-auto no-scrollbar">
            {qualityOptions.map((q) => {
              const active = defaultQuality === q;
              return (
                <button
                  key={q}
                  onClick={() => setDefaultQuality(q)}
                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-bold transition-all ${
                    active
                      ? 'bg-neon-purple text-white shadow-sm'
                      : 'text-void-400 hover:text-white'
                  }`}
                >
                  {q === 'auto' ? 'تلقائي' : q}
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Saver Mode Toggle */}
        <div 
          onClick={toggleDataSaver}
          className="flex items-center justify-between p-2 rounded-xl bg-black/20 hover:bg-black/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <Wifi size={14} className={dataSaver ? 'text-emerald-400' : 'text-void-500'} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-void-200">توفير باقة النت</span>
              <span className="text-[9px] text-void-500">تقليل استهلاك البيانات</span>
            </div>
          </div>
          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${dataSaver ? 'bg-emerald-500' : 'bg-void-700'}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${dataSaver ? '-translate-x-3.5' : 'translate-x-0'}`} />
          </div>
        </div>

        {/* Autoplay Next Toggle */}
        <div 
          onClick={toggleAutoplayNext}
          className="flex items-center justify-between p-2 rounded-xl bg-black/20 hover:bg-black/40 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <PlayCircle size={14} className={autoplayNext ? 'text-neon-purple' : 'text-void-500'} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-void-200">التشغيل التلقائي</span>
              <span className="text-[9px] text-void-500">تشغيل الفيديو التالي تلقائياً</span>
            </div>
          </div>
          <div className={`w-8 h-4.5 rounded-full p-0.5 transition-colors ${autoplayNext ? 'bg-neon-purple' : 'bg-void-700'}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${autoplayNext ? '-translate-x-3.5' : 'translate-x-0'}`} />
          </div>
        </div>
      </div>

      {/* 5. Storage & History Management */}
      <div className="rounded-2xl bg-[#14141d] border border-white/[0.06] p-3 flex flex-col gap-2.5 shadow-sm">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <HardDrive size={14} className="text-neon-purple" />
          إدارة الذاكرة والسجل
        </span>

        <div className="flex flex-col gap-1.5">
          {/* Clear History */}
          <button
            onClick={clearHistory}
            className="flex items-center justify-between p-2 rounded-xl bg-black/30 hover:bg-red-500/10 text-void-300 hover:text-red-400 text-xs transition-colors border border-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={13} />
              <span>مسح سجل المشاهدة</span>
            </div>
            <span className="text-[10px] text-void-500 bg-white/5 px-2 py-0.5 rounded-full">
              {history?.length || 0} فيديو
            </span>
          </button>

          {/* Clear Searches */}
          <button
            onClick={clearRecentSearches}
            className="flex items-center justify-between p-2 rounded-xl bg-black/30 hover:bg-red-500/10 text-void-300 hover:text-red-400 text-xs transition-colors border border-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <Trash2 size={13} />
              <span>مسح سجل البحث</span>
            </div>
            <span className="text-[10px] text-void-500 bg-white/5 px-2 py-0.5 rounded-full">
              {recentSearches?.length || 0} بحث
            </span>
          </button>

          {/* Clear Cache */}
          <button
            onClick={clearAppCache}
            className="flex items-center justify-between p-2 rounded-xl bg-black/30 hover:bg-emerald-500/10 text-void-300 hover:text-emerald-400 text-xs transition-colors border border-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <Zap size={13} />
              <span>تفريغ الذاكرة المؤقتة</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              تنظيف سريع
            </span>
          </button>
        </div>
      </div>

      {/* 6. Quick Access Drawers */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setIsDownloadsOpen(true);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 transition-all active:scale-95 text-xs font-bold"
        >
          <div className="flex items-center gap-1.5">
            <Download size={14} className="text-emerald-400" />
            <span>التنزيلات</span>
          </div>
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full">
            {downloads?.length || 0}
          </span>
        </button>

        <button
          onClick={() => {
            setIsWatchLaterOpen(true);
            if (window.innerWidth < 1024) setIsSidebarOpen(false);
          }}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-neon-purple/10 hover:bg-neon-purple/15 border border-neon-purple/20 text-purple-200 transition-all active:scale-95 text-xs font-bold"
        >
          <div className="flex items-center gap-1.5">
            <Bookmark size={14} className="text-neon-purple" />
            <span>المشاهدة لاحقاً</span>
          </div>
          <span className="text-[10px] bg-neon-purple/20 px-2 py-0.5 rounded-full">
            {watchLater?.length || 0}
          </span>
        </button>
      </div>

      {/* 7. App Info & Update Checker */}
      <div className="mt-auto pt-4 border-t border-white/[0.08] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-void-400">
          <span className="flex items-center gap-2 font-semibold text-white">
            <img src="/logo.png" alt="VoidTube" className="w-4 h-4 rounded-md object-cover" />
            VoidTube Native
          </span>
          <span className="font-mono text-[11px] text-white/80 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
            v{CURRENT_APP_VERSION}
          </span>
        </div>

        <button
          onClick={handleManualCheckUpdate}
          disabled={checkingUpdate}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-neon-purple/15 hover:bg-neon-purple/25 border border-neon-purple/30 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw size={13} className={`text-neon-purple ${checkingUpdate ? 'animate-spin' : ''}`} />
          <span>{checkingUpdate ? 'جارٍ التحقق...' : 'التحقق من وجود تحديثات'}</span>
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* =========================================================
          1. DESKTOP SETTINGS SIDEBAR (When isSidebarOpen is true)
         ========================================================= */}
      {isSidebarOpen && (
        <aside 
          className="hidden lg:flex flex-col shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar transition-all duration-300 w-80 rounded-3xl bg-[#0e0e14]/90 border border-white/[0.08] backdrop-blur-2xl shadow-2xl animate-fade-in mb-6"
          dir="rtl"
        >
          {renderContent()}
        </aside>
      )}

      {/* =========================================================
          2. MOBILE SETTINGS DRAWER OVERLAY (Slide-over from right)
         ========================================================= */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex justify-end animate-fade-in" dir="rtl">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-84 max-w-[85vw] h-full bg-[#101017] border-l border-white/10 shadow-2xl flex flex-col z-10 animate-slide-left overflow-y-auto no-scrollbar">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
}
