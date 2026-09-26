import React, { useState } from 'react';
import { Bookmark, History, Trash2, ArrowRight, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import VideoCard from '../components/VideoCard';

export default function BookmarksPage() {
  const { watchLater, clearAllWatchLater, history, clearHistory, navigateToHome, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('watchLater'); // 'watchLater' | 'history'
  const [confirmClear, setConfirmClear] = useState(false);

  const currentList = activeTab === 'watchLater' ? watchLater : (history || []);

  const handleClearCurrent = () => {
    if (activeTab === 'watchLater') {
      clearAllWatchLater();
      showToast('تم مسح قائمة المشاهدة لاحقاً', 'info');
    } else if (typeof clearHistory === 'function') {
      clearHistory();
      showToast('تم مسح سجل المشاهدات', 'info');
    }
    setConfirmClear(false);
  };

  return (
    <div className="flex flex-col gap-6 py-4 sm:py-6" dir="rtl">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-[#12121a] via-[#101016] to-[#12121a] border border-white/[0.06] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-neon-purple/15 text-neon-purple border border-neon-purple/30 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.25)] shrink-0">
            {activeTab === 'watchLater' ? <Bookmark size={22} className="fill-neon-purple/20" /> : <History size={22} />}
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>{activeTab === 'watchLater' ? 'قائمة المشاهدة لاحقاً' : 'سجل مقاطع الفيديو السابقة'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-void-300 font-mono font-medium">
                {currentList.length} فيديو
              </span>
            </h1>
            <p className="text-xs text-void-400 mt-1">
              {activeTab === 'watchLater' 
                ? 'فيديوهاتك المحفوظة للرجوع إليها لاحقاً على هذا الجهاز' 
                : 'تاريخ الفيديوهات التي شاهدتها مسبقاً لاستكمال المشاهدة'}
            </p>
          </div>
        </div>

        {/* Tab switcher & Clear Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Tab Selector */}
          <div className="flex p-1 rounded-2xl bg-[#161622] border border-white/5 shadow-inner">
            <button
              onClick={() => { setActiveTab('watchLater'); setConfirmClear(false); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                activeTab === 'watchLater'
                  ? 'bg-neon-purple text-white shadow-neon-purple'
                  : 'text-void-400 hover:text-white'
              }`}
            >
              <Bookmark size={13} />
              <span>المشاهدة لاحقاً ({watchLater.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('history'); setConfirmClear(false); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                activeTab === 'history'
                  ? 'bg-neon-purple text-white shadow-neon-purple'
                  : 'text-void-400 hover:text-white'
              }`}
            >
              <History size={13} />
              <span>السجل ({history?.length || 0})</span>
            </button>
          </div>

          {/* Clear Button */}
          {currentList.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 rounded-xl px-2.5 py-1.5 animate-fade-in">
                <span className="text-[11px] text-red-400 font-bold">مسح؟</span>
                <button
                  onClick={handleClearCurrent}
                  className="px-2 py-0.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold transition-colors"
                >
                  نعم
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-1.5 py-0.5 text-void-400 hover:text-white text-[11px]"
                >
                  إلغاء
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-[#161622] hover:bg-red-500/15 text-void-400 hover:text-red-400 text-xs font-bold border border-white/5 hover:border-red-500/30 transition-all active:scale-95"
                title="مسح الكل"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">مسح</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Grid or Empty State */}
      {currentList.length === 0 ? (
        <div className="w-full py-20 flex flex-col items-center justify-center text-center p-6">
          <div className="w-20 h-20 rounded-3xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple mb-4 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            {activeTab === 'watchLater' ? <Bookmark size={32} /> : <History size={32} />}
          </div>
          <h3 className="text-base font-extrabold text-white mb-1.5">
            {activeTab === 'watchLater' ? 'قائمة المشاهدة لاحقاً فارغة حالياً' : 'لم تشاهد أي فيديوهات بعد'}
          </h3>
          <p className="text-xs text-void-400 max-w-sm mb-6 leading-relaxed">
            {activeTab === 'watchLater'
              ? 'اضغط على أيقونة الحفظ (🔖) في بطاقة أي فيديو لحفظه في قائمتك الخاصة والعودة إليه بأي وقت.'
              : 'الفيديوهات التي تفتحها ستظهر هنا تلقائياً لكي تستطيع استكمال مشاهدتها لاحقاً بكل سهولة.'}
          </p>
          <button
            onClick={navigateToHome}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-neon-purple hover:bg-purple-600 text-white text-xs font-bold shadow-neon-purple transition-all active:scale-95"
          >
            <Sparkles size={14} />
            <span>تصفح الفيديوهات الرائجة الآن</span>
            <ArrowRight size={14} className="rotate-180" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {currentList.map((video, idx) => (
            <VideoCard
              key={(video.videoId || video.id || '') + idx}
              video={video}
            />
          ))}
        </div>
      )}
    </div>
  );
}
