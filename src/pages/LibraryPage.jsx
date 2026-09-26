import React, { useState } from 'react';
import { 
  Download, 
  Bookmark, 
  History, 
  HardDrive, 
  Play, 
  Trash2, 
  Sparkles, 
  Clock, 
  WifiOff, 
  Zap, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import VideoCard from '../components/VideoCard';
import { formatDuration, formatViews } from '../utils/formatters';

const TABS = [
  { id: 'downloads', label: 'التنزيلات أوفلاين', icon: Download },
  { id: 'watchLater', label: 'المشاهدة لاحقاً', icon: Bookmark },
  { id: 'history', label: 'سجل المشاهدة', icon: History },
];

export default function LibraryPage() {
  const {
    downloads = [],
    removeDownload,
    clearAllDownloads,
    watchLater = [],
    clearAllWatchLater,
    history = [],
    clearHistory,
    navigateToWatch,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('downloads');

  // Estimate offline storage used
  const estimatedStorageMb = (downloads.length * 28.5).toFixed(1);
  const totalWatchMinutes = history.reduce((acc, v) => acc + (v.lengthSeconds ? v.lengthSeconds / 60 : 10), 0);
  const totalWatchHours = (totalWatchMinutes / 60).toFixed(1);

  const handlePlayAll = (list) => {
    if (!list || list.length === 0) return;
    const first = list[0];
    navigateToWatch(first.videoId || first.id, first);
    showToast('بدء تشغيل القائمة 🎬', 'success');
  };

  return (
    <div className="w-full pb-16 animate-fade-in text-right" dir="rtl">
      
      {/* 1. Header & Stats Banner */}
      <div className="rounded-3xl glass-card p-5 sm:p-6 mb-6 border border-white/[0.08] relative overflow-hidden bg-gradient-to-r from-purple-950/20 via-[#0a0a0c] to-indigo-950/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neon-purple shadow-[0_0_10px_#8b5cf6]" />
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                المكتبة ومركز الوسائط (Media Hub)
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-void-300">
              جميع ملفاتك المحفوظة أوفلاين، وقوائم المشاهدة، وسجل المشاهدة الخالي من التتبع.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar">
            {/* Stat 1: Storage */}
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <HardDrive size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-void-400 font-bold">المساحة المحفوظة</span>
                <span className="text-xs font-black text-white font-mono">{estimatedStorageMb} MB</span>
              </div>
            </div>

            {/* Stat 2: Watch Time */}
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-neon-purple/15 text-neon-purple flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-void-400 font-bold">وقت المشاهدة النقي</span>
                <span className="text-xs font-black text-white font-mono">{totalWatchHours} ساعة</span>
              </div>
            </div>

            {/* Stat 3: Distraction Free */}
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-void-400 font-bold">الخصوصية</span>
                <span className="text-xs font-black text-cyan-400 font-mono">100% محلي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'downloads' ? downloads.length : tab.id === 'watchLater' ? watchLater.length : history.length;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-purple to-purple-700 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-neon-purple/40'
                    : 'text-void-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-void-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Batch Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'downloads' && downloads.length > 0 && (
            <>
              <button
                onClick={() => handlePlayAll(downloads)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Play size={13} className="fill-white" />
                <span className="hidden sm:inline">تشغيل الكل</span>
              </button>
              <button
                onClick={clearAllDownloads}
                className="p-2 rounded-xl text-void-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="مسح كل التنزيلات"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}

          {activeTab === 'watchLater' && watchLater.length > 0 && (
            <>
              <button
                onClick={() => handlePlayAll(watchLater)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neon-purple hover:bg-purple-600 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Play size={13} className="fill-white" />
                <span className="hidden sm:inline">تشغيل الكل</span>
              </button>
              <button
                onClick={clearAllWatchLater}
                className="p-2 rounded-xl text-void-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="مسح قائمة المشاهدة لاحقاً"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}

          {activeTab === 'history' && history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-void-300 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold transition-colors"
            >
              <Trash2 size={14} />
              <span>مسح السجل</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Tab Contents */}
      {activeTab === 'downloads' && (
        downloads.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center glass-card rounded-3xl p-8">
            <WifiOff size={44} className="text-void-500 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">لا توجد فيديوهات محمّلة أوفلاين</h3>
            <p className="text-xs text-void-400 max-w-sm mb-4">
              يمكنك تحميل أي مقطع بالنقر على زر التنزيل الأخضر لمشاهدته بدون الحاجة لاتصال بالإنترنت!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {downloads.map((video, idx) => (
              <VideoCard key={video.videoId || idx} video={video} />
            ))}
          </div>
        )
      )}

      {activeTab === 'watchLater' && (
        watchLater.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center glass-card rounded-3xl p-8">
            <Bookmark size={44} className="text-void-500 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">قائمة المشاهدة لاحقاً فارغة</h3>
            <p className="text-xs text-void-400 max-w-sm">
              اضغط على علامة الحفظ المرجعي على أي كارت فيديو لحفظه في هذه القائمة ومشاهدته لاحقاً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watchLater.map((video, idx) => (
              <VideoCard key={video.videoId || idx} video={video} />
            ))}
          </div>
        )
      )}

      {activeTab === 'history' && (
        history.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center glass-card rounded-3xl p-8">
            <History size={44} className="text-void-500 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white mb-1">سجل المشاهدة فارغ</h3>
            <p className="text-xs text-void-400 max-w-sm">
              الفيديوهات التي تشاهدها ستظهر هنا تلقائياً لسهولة الرجوع إليها بدون أي تتبع خارجي.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {history.map((video, idx) => (
              <VideoCard key={video.videoId || idx} video={video} />
            ))}
          </div>
        )
      )}

    </div>
  );
}
