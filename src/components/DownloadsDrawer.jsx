import React, { useState } from 'react';
import { X, Trash2, Play, Download, ArrowRight, HardDrive, Smartphone, Check, ExternalLink } from 'lucide-react';
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
    navigateToHome
  } = useApp();

  const [confirmClear, setConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  if (!isDownloadsOpen) return null;

  const handlePlay = (video) => {
    setIsDownloadsOpen(false);
    navigateToWatch(video.videoId || video.id, video);
  };

  const handleReDownloadToPhone = (video) => {
    const filename = `${(video.title || 'video').replace(/[/\\?%*:|"<>]/g, '_')}_${video.quality || '720p'}.mp4`;
    const url = video.url || `https://invidious.f5.si/latest_version?id=${video.videoId}&itag=${video.quality?.includes('360') ? '18' : '22'}`;
    
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    setCopiedId(video.videoId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
      {/* Backdrop */}
      <div
        onClick={() => {
          setIsDownloadsOpen(false);
          setConfirmClear(false);
        }}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
      />

      {/* Slide-out Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#0e0e14] border-l border-white/[0.08] shadow-2xl flex flex-col animate-slide-left">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm">
                <Download size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  التنزيلات المحفوظة
                  {downloads.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      {downloads.length}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-void-400">محفوظة على هاتفك وبدون إعلانات</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {downloads.length > 0 && (
                confirmClear ? (
                  <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/30 rounded-xl px-2 py-1">
                    <span className="text-[10px] text-red-400 font-bold">مسح الكل؟</span>
                    <button
                      onClick={() => {
                        clearAllDownloads();
                        setConfirmClear(false);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-red-500 text-white text-[10px] font-bold"
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
                className="p-2 rounded-xl text-void-400 hover:text-white hover:bg-white/10 transition-colors"
                title="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Info Pill */}
          {downloads.length > 0 && (
            <div className="mx-4 mt-3 p-3 rounded-2xl bg-[#14141c] border border-white/[0.05] flex items-center justify-between text-xs text-void-300">
              <div className="flex items-center gap-2">
                <Smartphone size={15} className="text-emerald-400" />
                <span>الملفات في مجلد <strong className="text-white">Downloads</strong> بالهاتف</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                جاهز للمشاهدة
              </span>
            </div>
          )}

          {/* Video List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {downloads.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 shadow-glow-sm">
                  <Download size={26} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">لا توجد فيديوهات منزلة بعد</h3>
                <p className="text-xs text-void-400 max-w-xs mb-5 leading-relaxed">
                  اضغط على زر <strong className="text-emerald-400">تنزيل 📥</strong> أسفل أي فيديو لحفظه مباشرة على هاتفك وتطبيق VoidTube ومشاهدته بأي وقت بدون إنترنت.
                </p>
                <button
                  onClick={() => {
                    setIsDownloadsOpen(false);
                    navigateToHome();
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  استكشف الفيديوهات الآن
                  <ArrowRight size={14} className="rotate-180" />
                </button>
              </div>
            ) : (
              downloads.map((video) => {
                const vidId = video.videoId || video.id;
                const thumb = video.thumbnail || `https://i.ytimg.com/vi/${vidId}/mqdefault.jpg`;
                const isCopied = copiedId === vidId;

                return (
                  <div
                    key={vidId}
                    className="p-3 rounded-2xl bg-[#14141c] hover:bg-[#181822] border border-white/[0.05] hover:border-emerald-500/30 transition-all flex flex-col gap-2.5 group"
                  >
                    {/* Top Row: Thumbnail + Details */}
                    <div className="flex gap-3">
                      {/* Thumbnail Container */}
                      <div 
                        onClick={() => handlePlay(video)}
                        className="relative w-28 aspect-video rounded-xl overflow-hidden bg-black shrink-0 cursor-pointer shadow-md group/thumb"
                      >
                        <img
                          src={thumb}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                            <Play size={15} className="fill-white ml-0.5" />
                          </div>
                        </div>
                        {video.lengthSeconds ? (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-bold text-white">
                            {formatDuration(video.lengthSeconds)}
                          </span>
                        ) : null}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 
                            onClick={() => handlePlay(video)}
                            className="text-xs font-bold text-white line-clamp-2 leading-snug cursor-pointer hover:text-emerald-400 transition-colors"
                            title={video.title}
                          >
                            {video.title}
                          </h4>
                          <p className="text-[11px] text-void-400 mt-1 truncate">
                            {video.author || 'قناة يوتيوب'}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                            {video.quality || '720p HD'}
                          </span>
                          {video.fileSize && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-void-300">
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-xs font-semibold transition-all"
                      >
                        <Play size={13} className="fill-current" />
                        <span>تشغيل الآن</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        {/* Save to Phone Storage Button */}
                        <button
                          onClick={() => handleReDownloadToPhone(video)}
                          title="حفظ ملف الفيديو على ذاكرة الهاتف مجدداً"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#1c1c28] hover:bg-[#252536] text-void-200 hover:text-white text-xs font-medium border border-white/5 transition-all"
                        >
                          {isCopied ? (
                            <>
                              <Check size={13} className="text-emerald-400" />
                              <span className="text-emerald-400 text-[11px]">بدأ التحميل</span>
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
                          onClick={() => removeDownload(vidId)}
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
            <div className="p-3 border-t border-white/[0.06] bg-[#0b0b10] flex items-center justify-between text-[11px] text-void-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <HardDrive size={13} />
                تخزين سريع بدون إعلانات
              </span>
              <span>{downloads.length} فيديو محفوظ</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
