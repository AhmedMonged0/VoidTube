import React, { useState } from 'react';
import { X, Download, Film, Music, Check, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export default function DownloadModal({ videoData, videoId, isOpen, onClose }) {
  if (!isOpen || !videoId) return null;

  const title = videoData?.title || 'VoidTube Video';
  const formatStreams = videoData?.formatStreams || [];
  const adaptiveFormats = videoData?.adaptiveFormats || [];

  // Filter 720p, 360p MP4 formats
  const hdStream = formatStreams.find(f => f.resolution === '720p' && f.container === 'mp4') || formatStreams.find(f => f.resolution === '720p');
  const sdStream = formatStreams.find(f => f.resolution === '360p' && f.container === 'mp4') || formatStreams.find(f => f.resolution === '360p') || formatStreams[0];
  
  // Audio stream
  const audioStream = adaptiveFormats.find(f => f.type?.includes('audio') || f.container === 'm4a') || adaptiveFormats.find(f => f.type?.includes('audio'));

  const handleTriggerDownload = (url, filename) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${title}.mp4`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Content */}
      <div
        dir="rtl"
        className="relative w-full max-w-lg rounded-2xl bg-[#121218] border border-white/[0.08] shadow-2xl p-6 flex flex-col gap-5 text-right z-10 animate-fade-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-purple/15 text-neon-purple border border-neon-purple/25">
              <Download size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                تنزيل الفيديو
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-semibold">
                  غير محدود ومجاني
                </span>
              </h3>
              <p className="text-xs text-void-400">اختر الجودة المطلوبة للتحميل المباشر لجهازك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-void-400 hover:text-white hover:bg-void-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Preview Snippet */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#161620] border border-white/[0.04]">
          <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0">
            <img
              src={`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-void-100 line-clamp-2 leading-snug" title={title}>
              {title}
            </h4>
            <p className="text-[11px] text-void-400 mt-1 truncate">{videoData?.author}</p>
          </div>
        </div>

        {/* Download Options List */}
        <div className="space-y-2.5">
          
          {/* Option 1: 720p HD */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161622] hover:bg-[#1a1a28] border border-white/[0.05] hover:border-neon-purple/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-neon-purple/10 text-neon-purple">
                <Film size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">فيديو عالي الدقة HD</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neon-purple/20 text-neon-purple font-semibold">720p MP4</span>
                </div>
                <span className="text-[11px] text-void-400">أعلى جودة صوت وصورة للموبايل والشاشات</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (hdStream?.url) {
                  handleTriggerDownload(hdStream.url, `${title}_720p.mp4`);
                } else {
                  // Direct clean fallback
                  window.open(`https://yewtu.be/latest_version?id=${videoId}&itag=22`, '_blank');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neon-purple hover:bg-purple-600 text-white text-xs font-semibold shadow-neon-purple transition-all"
            >
              <Download size={14} />
              <span>تحميل</span>
            </button>
          </div>

          {/* Option 2: 360p Standard (Data Saver) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161622] hover:bg-[#1a1a28] border border-white/[0.05] hover:border-neon-purple/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Film size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">فيديو متوسط الجودة</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold">360p MP4</span>
                </div>
                <span className="text-[11px] text-void-400">حجم خفيف موفر للمساحة وباقة الإنترنت</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (sdStream?.url) {
                  handleTriggerDownload(sdStream.url, `${title}_360p.mp4`);
                } else {
                  window.open(`https://yewtu.be/latest_version?id=${videoId}&itag=18`, '_blank');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-void-800 hover:bg-void-750 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              <Download size={14} />
              <span>تحميل</span>
            </button>
          </div>

          {/* Option 3: Audio Only (MP3 / M4A) */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#161622] hover:bg-[#1a1a28] border border-white/[0.05] hover:border-neon-purple/40 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Music size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">تحميل الصوت فقط</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold">Audio / M4A</span>
                </div>
                <span className="text-[11px] text-void-400">ملف صوتي نقي للاستماع بدون فيديو</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (audioStream?.url) {
                  handleTriggerDownload(audioStream.url, `${title}_audio.m4a`);
                } else {
                  window.open(`https://yewtu.be/latest_version?id=${videoId}&itag=140`, '_blank');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-void-800 hover:bg-void-750 text-white text-xs font-semibold border border-white/10 transition-all"
            >
              <Download size={14} />
              <span>تحميل صوت</span>
            </button>
          </div>

        </div>

        {/* Footer info pledge */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-void-500">
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck size={13} />
            تنزيل مباشر 100% بدون إعلانات أو تحويلات
          </span>
          <span>VoidTube Downloader</span>
        </div>

      </div>
    </div>
  );
}
