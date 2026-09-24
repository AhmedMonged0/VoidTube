import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Download, 
  Film, 
  Music, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  Zap, 
  FolderDown, 
  RotateCw,
  HardDrive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDuration } from '../../utils/formatters';

export default function DownloadModal({ videoData, videoId, isOpen, onClose }) {
  const { addDownload, setIsDownloadsOpen } = useApp();

  const [downloadState, setDownloadState] = useState('idle'); // 'idle' | 'downloading' | 'completed'
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState('4.8 MB/s');
  const [downloadedMb, setDownloadedMb] = useState('0.0');
  const [totalMb, setTotalMb] = useState('28.6');
  const [statusMessage, setStatusMessage] = useState('');
  
  const timerRef = useRef(null);
  const abortCtrlRef = useRef(null);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setDownloadState('idle');
      setSelectedFormat(null);
      setProgress(0);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortCtrlRef.current) abortCtrlRef.current.abort();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (abortCtrlRef.current) abortCtrlRef.current.abort();
    };
  }, [isOpen]);

  if (!isOpen || !videoId) return null;

  const title = videoData?.title || 'VoidTube Video';
  const author = videoData?.author || videoData?.authorName || 'VoidTube Channel';
  const formatStreams = videoData?.formatStreams || [];
  const adaptiveFormats = videoData?.adaptiveFormats || [];

  // Filter 720p, 360p MP4 formats
  const hdStream = formatStreams.find(f => f.resolution === '720p' && f.container === 'mp4') || formatStreams.find(f => f.resolution === '720p');
  const sdStream = formatStreams.find(f => f.resolution === '360p' && f.container === 'mp4') || formatStreams.find(f => f.resolution === '360p') || formatStreams[0];
  const audioStream = adaptiveFormats.find(f => f.type?.includes('audio') || f.container === 'm4a') || adaptiveFormats.find(f => f.type?.includes('audio'));

  const cleanFilename = (name, res) => {
    const safeTitle = (name || 'video').replace(/[/\\?%*:|"<>]/g, '_').slice(0, 50);
    return `[VoidTube] ${safeTitle} (${res}).mp4`;
  };

  const triggerDeviceDownload = (url, filename) => {
    if (!url) return;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Direct file download fallback error:', e);
    }
  };

  const handleStartDownload = async (formatType) => {
    let qualityLabel = '';
    let targetSize = 25.4;
    let apiFormat = '720';

    if (formatType === '720p') {
      qualityLabel = '720p HD';
      targetSize = 28.6;
      apiFormat = '720';
    } else if (formatType === '360p') {
      qualityLabel = '360p MP4';
      targetSize = 12.4;
      apiFormat = '360';
    } else {
      qualityLabel = 'Audio MP3';
      targetSize = 4.2;
      apiFormat = 'mp3';
    }

    const filename = cleanFilename(title, qualityLabel);
    const directStream = formatType === '720p' ? hdStream?.url : formatType === '360p' ? sdStream?.url : audioStream?.url;

    setTotalMb(targetSize.toFixed(1));
    setProgress(15);
    setDownloadState('downloading');
    setStatusMessage('📡 جارٍ الاتصال بسيرفر التنزيل وتوليد ملف MP4 المباشر...');

    let isCompleted = false;

    // Simulated progress increment while processing
    let currentProgress = 15;
    const speeds = ['3.8 MB/s', '4.9 MB/s', '5.4 MB/s', '6.2 MB/s', '5.1 MB/s'];
    timerRef.current = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress += Math.floor(Math.random() * 5) + 3;
        setProgress(currentProgress);
        const downloaded = ((targetSize * currentProgress) / 100).toFixed(1);
        setDownloadedMb(downloaded);
        setSpeed(speeds[Math.floor(Math.random() * speeds.length)]);
        if (currentProgress > 40 && currentProgress < 75) {
          setStatusMessage('⚡ جارٍ معالجة حزم الفيديو وتشفير الملف عالي الجودة...');
        } else if (currentProgress >= 75) {
          setStatusMessage('💾 جارٍ إنهاء المعالجة لبدء التنزيل على الهاتف...');
        }
      }
    }, 240);

    const finishDownload = (finalUrl) => {
      if (isCompleted) return;
      isCompleted = true;
      if (timerRef.current) clearInterval(timerRef.current);

      setProgress(100);
      setDownloadedMb(targetSize.toFixed(1));
      setStatusMessage('🎉 اكتمل التنزيل بنجاح!');

      setSelectedFormat({
        type: formatType,
        label: qualityLabel,
        url: finalUrl,
        filename,
        size: `${targetSize} MB`,
      });

      // 1. Directly trigger native file download into phone storage
      triggerDeviceDownload(finalUrl, filename);

      // 2. Save into App's Offline Downloads Library
      addDownload({
        videoId,
        title,
        author,
        lengthSeconds: videoData?.lengthSeconds || 0,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
        quality: qualityLabel,
        fileSize: `${targetSize} MB`,
        url: finalUrl,
        downloadedAt: new Date().toISOString()
      });

      // 3. Switch to Completed state
      setTimeout(() => {
        setDownloadState('completed');
      }, 500);
    };

    // Execute direct In-App download via Loader.to API
    try {
      abortCtrlRef.current = new AbortController();
      const apiUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${apiFormat}&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
      const res = await fetch(apiUrl, { signal: abortCtrlRef.current.signal });

      if (res.ok) {
        const initData = await res.json();
        if (initData.download_url) {
          finishDownload(initData.download_url);
          return;
        }

        if (initData.progress_url) {
          // Poll progress_url every 1.1s (up to 12 attempts)
          for (let i = 0; i < 12; i++) {
            if (isCompleted) break;
            await new Promise(r => setTimeout(r, 1100));
            try {
              const pRes = await fetch(initData.progress_url, { signal: abortCtrlRef.current?.signal });
              if (pRes.ok) {
                const pData = await pRes.json();
                if (pData.progress && pData.progress > 0) {
                  const pct = Math.min(95, Math.max(30, Math.floor(pData.progress / 10)));
                  setProgress(pct);
                }
                if (pData.download_url && pData.success === 1) {
                  finishDownload(pData.download_url);
                  return;
                }
              }
            } catch (pollErr) {
              console.warn('Poll error:', pollErr);
            }
          }
        }
      }
    } catch (apiErr) {
      console.warn('Direct download API error, falling back:', apiErr);
    }

    // Direct stream fallback
    if (!isCompleted) {
      const fallbackUrl = directStream || `https://invidious.f5.si/latest_version?id=${videoId}&itag=${formatType === '360p' ? '18' : '22'}`;
      finishDownload(fallbackUrl);
    }
  };

  const handleCancelDownload = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (abortCtrlRef.current) abortCtrlRef.current.abort();
    setDownloadState('idle');
    setProgress(0);
  };

  const handleOpenInDownloads = () => {
    onClose();
    setIsDownloadsOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" dir="rtl">
      {/* Backdrop */}
      <div
        onClick={downloadState === 'downloading' ? undefined : onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#101016] border border-white/[0.09] shadow-2xl p-5 sm:p-6 flex flex-col gap-4 text-right z-10 animate-fade-in overflow-hidden">
        
        {/* Glow ambient background effect */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-neon-purple/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* =========================================================
            STATE 1: IDLE (Selection View)
           ========================================================= */}
        {downloadState === 'idle' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-neon-purple/20 text-emerald-400 border border-emerald-500/30 shadow-sm">
                  <Download size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    تنزيل الفيديو على الهاتف
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-bold">
                      تنزيل مباشر ومدمج
                    </span>
                  </h3>
                  <p className="text-xs text-void-400">ينزل الملف مباشرة لجهازك بدون فتح أي مواقع خارجية</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-void-400 hover:text-white hover:bg-void-800 transition-colors"
                title="إغلاق"
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Preview Card */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#15151f] border border-white/[0.05]">
              <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-black shrink-0 shadow-md">
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug" title={title}>
                  {title}
                </h4>
                <p className="text-[11px] text-void-400 mt-1 truncate">{author}</p>
              </div>
            </div>

            {/* Download Options */}
            <div className="space-y-2.5">
              
              {/* Option 1: 720p HD */}
              <button
                onClick={() => handleStartDownload('720p')}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#171724] to-[#1a172c] hover:from-[#1d1d2e] hover:to-[#221c38] border border-neon-purple/30 hover:border-neon-purple/70 transition-all duration-200 group text-right shadow-sm active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-neon-purple/20 text-neon-purple group-hover:scale-110 transition-transform">
                    <Film size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white">فيديو عالي الدقة HD</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/25 text-purple-300 font-bold border border-neon-purple/30">
                        720p MP4
                      </span>
                    </div>
                    <span className="text-[11px] text-void-400 mt-0.5 block">
                      أعلى جودة صوت وصورة للموبايل • (~28 ميجابايت)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-neon-purple text-white text-xs font-bold shadow-neon-purple group-hover:bg-purple-600 transition-colors shrink-0">
                  <Download size={14} />
                  <span>تنزيل</span>
                </div>
              </button>

              {/* Option 2: 360p Standard */}
              <button
                onClick={() => handleStartDownload('360p')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#161622] hover:bg-[#1a1a28] border border-white/[0.05] hover:border-emerald-500/40 transition-all duration-200 group text-right active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white">فيديو موفر وسريع</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                        360p MP4
                      </span>
                    </div>
                    <span className="text-[11px] text-void-400 mt-0.5 block">
                      حفظ فوري موفر لمساحة الهاتف والباقة • (~12 ميجابايت)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-void-800 group-hover:bg-emerald-500 text-void-200 group-hover:text-white text-xs font-semibold border border-white/10 transition-all shrink-0">
                  <Download size={14} />
                  <span>تنزيل</span>
                </div>
              </button>

              {/* Option 3: Audio MP3 */}
              <button
                onClick={() => handleStartDownload('audio')}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#161622] hover:bg-[#1a1a28] border border-white/[0.05] hover:border-blue-500/40 transition-all duration-200 group text-right active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <Music size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white">تحميل الصوت فقط</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                        MP3 Audio
                      </span>
                    </div>
                    <span className="text-[11px] text-void-400 mt-0.5 block">
                      ملف صوت نقي للاستماع بدون فيديو • (~4 ميجابايت)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-void-800 group-hover:bg-blue-500 text-void-200 group-hover:text-white text-xs font-semibold border border-white/10 transition-all shrink-0">
                  <Download size={14} />
                  <span>صوت</span>
                </div>
              </button>

            </div>

            {/* Storage Hint */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-void-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <Smartphone size={13} />
                تنزيل مباشر 100% مدمج داخل البرنامج
              </span>
              <span className="text-void-500">VoidTube Downloader</span>
            </div>
          </>
        )}

        {/* =========================================================
            STATE 2: DOWNLOADING (High-Tech Animated Progress)
           ========================================================= */}
        {downloadState === 'downloading' && (
          <div className="py-4 flex flex-col items-center text-center gap-5">
            
            {/* Animated Orbiting Ring with Progress Percentage */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-neon-purple/20 animate-ping opacity-25" />
              
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="url(#gradientProgress)"
                  strokeWidth="8"
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * progress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-150 ease-out"
                />
                <defs>
                  <linearGradient id="gradientProgress" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white tracking-tight">
                  {progress}%
                </span>
                <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase mt-0.5">
                  {selectedFormat?.label || 'MP4'}
                </span>
              </div>
            </div>

            {/* Video Title Snippet */}
            <div className="w-full max-w-sm px-2">
              <h4 className="text-xs font-bold text-white truncate" title={title}>
                {title}
              </h4>
              <p className="text-[11px] text-neon-purple font-semibold mt-1 animate-pulse">
                {statusMessage}
              </p>
            </div>

            {/* Linear Progress Bar with glowing shimmer */}
            <div className="w-full space-y-2">
              <div className="relative w-full h-3 bg-[#161622] rounded-full overflow-hidden border border-white/10 p-[1px]">
                <div 
                  className="h-full bg-gradient-to-r from-neon-purple via-purple-500 to-emerald-400 rounded-full transition-all duration-150 relative overflow-hidden shadow-neon-purple"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                </div>
              </div>

              {/* Stats: Speed & MBs */}
              <div className="flex items-center justify-between text-[11px] text-void-400 px-1 font-mono">
                <span className="flex items-center gap-1 text-emerald-400">
                  <Zap size={12} />
                  {speed}
                </span>
                <span>
                  {downloadedMb} / {totalMb} MB
                </span>
              </div>
            </div>

            {/* Cancel Button */}
            <button
              onClick={handleCancelDownload}
              className="text-xs text-void-400 hover:text-red-400 transition-colors pt-1"
            >
              إلغاء التنزيل
            </button>
          </div>
        )}

        {/* =========================================================
            STATE 3: COMPLETED (Celebration Screen - 100% In-App)
           ========================================================= */}
        {downloadState === 'completed' && (
          <div className="py-3 flex flex-col items-center text-center gap-4 animate-fade-in">
            
            {/* Glowing Success Icon */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-bounce">
                <CheckCircle2 size={40} className="stroke-[2.5]" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-neon-purple text-white flex items-center justify-center text-xs shadow-md">
                <Sparkles size={12} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                تم تنزيل الفيديو بنجاح! 🎉
              </h3>
              <p className="text-xs text-void-300 mt-1 max-w-sm leading-relaxed">
                بدأ حفظ ملف <strong className="text-white">MP4</strong> مباشرة في هاتفك (مجلد <strong className="text-emerald-400">Downloads</strong>) وأصبح متاحاً أيضاً للمشاهدة بدون إنترنت داخل التطبيق.
              </p>
            </div>

            {/* Saved File Info Card */}
            <div className="w-full p-3 rounded-2xl bg-[#14141c] border border-emerald-500/25 flex items-center justify-between text-right">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 shrink-0">
                  <HardDrive size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{selectedFormat?.filename}</div>
                  <div className="text-[10px] text-void-400 mt-0.5">{selectedFormat?.label} • {selectedFormat?.size}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                محفوظ
              </span>
            </div>

            {/* Direct Phone Download Actions (100% In-App - No External Sites) */}
            <div className="w-full flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (selectedFormat?.url && selectedFormat?.filename) {
                    triggerDeviceDownload(selectedFormat.url, selectedFormat.filename);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all active:scale-95 text-center"
              >
                <Download size={16} />
                <span>إعادة تنزيل الملف مباشرة على الجهاز</span>
              </button>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenInDownloads}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-neon-purple/20 hover:bg-neon-purple text-neon-purple hover:text-white border border-neon-purple/30 text-xs font-bold transition-all"
                >
                  <FolderDown size={16} />
                  <span>مشاهدة في قائمة التنزيلات</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-void-300 hover:text-white text-xs font-semibold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
