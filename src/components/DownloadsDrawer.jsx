import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Play, 
  Download, 
  ArrowRight, 
  HardDrive, 
  Smartphone, 
  Check, 
  Sparkles, 
  CheckCircle2, 
  Film,
  FolderDown,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration } from '../utils/formatters';

export default function DownloadsDrawer() {
  const {
    downloads,
    isDownloadsOpen,
    setIsDownloadsOpen,
    removeDownload,
    clearAllDownloads,
    navigateToWatch,
    navigateToHome,
    triggerBackgroundDownload,
    showToast
  } = useApp();

  const [confirmClear, setConfirmClear] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  if (!isDownloadsOpen) return null;

  const handlePlay = (video) => {
    setIsDownloadsOpen(false);
    navigateToWatch(video.videoId || video.id, video);
  };

  const handleReDownloadToPhone = (video) => {
    const vidId = video.videoId || video.id;
    if (video.url && !video.url.includes('invidious') && !video.url.includes('latest_version')) {
      const cleanTitle = (video.title || 'video').replace(/[/\\?%*:|"<>]/g, '_').slice(0, 50).trim();
      const filename = `[VoidTube] ${cleanTitle} (${video.quality || '720p'}).mp4`;
      const downloadHref = `/api/download-file?url=${encodeURIComponent(video.url)}&name=${encodeURIComponent(filename)}`;
      const a = document.createElement('a');
      a.href = downloadHref;
      a.download = filename;
      a.setAttribute('download', filename);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try { document.body.removeChild(a); } catch (_) {}
      }, 500);

      setDownloadingId(vidId);
      showToast('بدأ تحميل ملف الفيديو إلى جهازك 📥', 'success');
      setTimeout(() => setDownloadingId(null), 3000);
    } else {
      setIsDownloadsOpen(false);
      if (typeof triggerBackgroundDownload === 'function') {
        triggerBackgroundDownload({
          ...video,
          videoId: vidId
        });
      }
      showToast('جاري استخراج رابط التحميل عالي السرعة...', 'info');
    }
  };

  // Estimate total storage roughly (assuming average ~35MB per 720p video if not provided)
  const totalEstimatedMb = downloads.reduce((acc, v) => {
    if (v.fileSizeBytes) return acc + Math.round(v.fileSizeBytes / (1024 * 1024));
    return acc + 35;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop with modern blur */}
      <div
        onClick={() => {
          setIsDownloadsOpen(false);
          setConfirmClear(false);
        }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#0a0a0f] border-l border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col animate-slide-left relative overflow-hidden">
          
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 left-0 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl pointer-events-none" />

          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.06] bg-[#0e0e15]/90 backdrop-blur-xl relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <FolderDown size={20} />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                  التنزيلات المحفوظة
                  {downloads.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                      {downloads.length}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-void-400 flex items-center gap-1 mt-0.5">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  <span>مشاهدة فورية بدون إنترنت وبدون إعلانات</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {downloads.length > 0 && (
                confirmClear ? (
                  <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 rounded-xl px-2.5 py-1 animate-fade-in">
                    <span className="text-[10px] text-red-400 font-bold">مسح الكل؟</span>
                    <button
                      onClick={() => {
                        clearAllDownloads();
                        setConfirmClear(false);
                        showToast('تم مسح جميع التنزيلات بنجاح', 'info');
                      }}
                      className="px-2 py-0.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold transition-colors"
                    >
                      نعم
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-1.5 py-0.5 text-void-400 hover:text-white text-[10px]"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="p-2 rounded-xl text-void-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="مسح كل التنزيلات"
                  >
                    <Trash2 size={16} />
                  </button>
                )
              )}

              <button
                onClick={() => {
                  setIsDownloadsOpen(false);
                  setConfirmClear(false);
                }}
                className="p-2 rounded-xl text-void-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                title="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Storage Info Banner */}
          {downloads.length > 0 && (
            <div className="mx-4 mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-[#12121c] to-[#161624] border border-white/[0.06] flex items-center justify-between text-xs text-void-300 relative z-10 shadow-sm">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-emerald-400" />
                <span className="text-[11px]">المساحة التقديرية: <strong className="text-white font-mono">{totalEstimatedMb} MB</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>جاهز للأوفلاين</span>
              </div>
            </div>
          )}

          {/* Video List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
            {downloads.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/15 via-[#12121a] to-neon-purple/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
                  <Download size={32} className="animate-bounce" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h3 className="text-base font-extrabold text-white mb-1.5">لا توجد فيديوهات منزلة بعد</h3>
                <p className="text-xs text-void-400 max-w-xs mb-6 leading-relaxed">
                  احفظ مقاطعك المفضلة للمشاهدة بدون إنترنت أثناء السفر أو التنقل! اضغط على زر <strong className="text-emerald-400">تنزيل 📥</strong> أسفل أي فيديو في تطبيق VoidTube.
                </p>
                <button
                  onClick={() => {
                    setIsDownloadsOpen(false);
                    navigateToHome();
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                >
                  <Sparkles size={14} />
                  <span>تصفح الفيديوهات الرائجة الآن</span>
                  <ArrowRight size={14} className="rotate-180" />
                </button>
              </div>
            ) : (
              downloads.map((video) => {
                const vidId = video.videoId || video.id;
                const thumb = video.thumbnail || `https://i.ytimg.com/vi/${vidId}/mqdefault.jpg`;
                const isDownloadingThis = downloadingId === vidId;

                return (
                  <div
                    key={vidId}
                    className="p-3 rounded-2xl bg-[#12121a] hover:bg-[#161622] border border-white/[0.05] hover:border-emerald-500/30 transition-all flex flex-col gap-2.5 group shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                  >
                    {/* Top Row: Thumbnail + Details */}
                    <div className="flex gap-3">
                      {/* Thumbnail Container */}
                      <div 
                        onClick={() => handlePlay(video)}
                        className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer shadow-md group/thumb"
                      >
                        <img
                          src={thumb}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg transform group-hover/thumb:scale-110 transition-transform">
                            <Play size={15} className="fill-white ml-0.5" />
                          </div>
                        </div>
                        {video.lengthSeconds ? (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold text-white font-mono">
                            {formatDuration(video.lengthSeconds)}
                          </span>
                        ) : null}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h4 
                            onClick={() => handlePlay(video)}
                            className="text-xs font-bold text-white line-clamp-2 leading-snug cursor-pointer hover:text-emerald-400 transition-colors"
                            title={video.title}
                          >
                            {video.title}
                          </h4>
                          <p className="text-[11px] text-void-400 mt-1 truncate">
                            {video.author || video.authorName || 'قناة يوتيوب'}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            {video.quality || '720p HD'}
                          </span>
                          {video.fileSize && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-void-300 font-mono">
                              {video.fileSize}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Buttons Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                      {/* Play Action */}
                      <button
                        onClick={() => handlePlay(video)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        <Play size={13} className="fill-current" />
                        <span>تشغيل أوفلاين</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* Save to Phone Storage Button */}
                        <button
                          onClick={() => handleReDownloadToPhone(video)}
                          title="حفظ ملف الفيديو على ذاكرة الهاتف مجدداً"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1c1c28] hover:bg-[#252536] text-void-200 hover:text-white text-xs font-medium border border-white/5 transition-all"
                        >
                          {isDownloadingThis ? (
                            <>
                              <Check size={13} className="text-emerald-400" />
                              <span className="text-emerald-400 text-[11px] font-bold">جارٍ التنزيل</span>
                            </>
                          ) : (
                            <>
                              <Download size={13} />
                              <span className="text-[11px]">تنزيل للهاتف</span>
                            </>
                          )}
                        </button>

                        {/* Remove from downloads */}
                        <button
                          onClick={() => {
                            removeDownload(vidId);
                            showToast('تم حذف الفيديو من قائمة التنزيلات', 'info');
                          }}
                          title="حذف من قائمة التنزيلات"
                          className="p-1.5 rounded-xl text-void-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          {downloads.length > 0 && (
            <div className="p-3.5 border-t border-white/[0.06] bg-[#0b0b10] flex items-center justify-between text-[11px] text-void-400 relative z-10">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Smartphone size={13} />
                <span>مشاهدة سلسة بدون استهلاك باقة الإنترنت</span>
              </span>
              <span className="font-mono text-white font-bold">{downloads.length} فيديو</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
