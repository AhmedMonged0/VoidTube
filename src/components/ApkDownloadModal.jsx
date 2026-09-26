import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Smartphone, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  Zap,
  ArrowRight,
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ApkDownloadModal({ isOpen, onClose }) {
  const { CURRENT_APP_VERSION, showToast } = useApp();
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDownloadStarted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadClick = () => {
    setDownloadStarted(true);
    if (showToast) showToast('بدأ تحميل تطبيق VoidTube للأندرويد 🚀', 'success');
    const link = document.createElement('a');
    link.href = '/VoidTube.apk';
    link.download = 'VoidTube.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg bg-[#0e0e15] border border-neon-purple/40 rounded-3xl p-5 sm:p-8 shadow-[0_20px_70px_rgba(168,85,247,0.35)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-neon-purple/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-void-300 hover:text-white transition-all active:scale-95"
          title="إغلاق"
        >
          <X size={18} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#09090d] border border-neon-purple/50 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.4)] mb-3.5 relative overflow-hidden">
            <img src="/logo.png" alt="VoidTube App" className="w-full h-full object-cover" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-black text-black items-center justify-center">✓</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              تطبيق VoidTube للأندرويد
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/40 font-mono">
              v{CURRENT_APP_VERSION || '1.1.0'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-void-300 max-w-sm leading-relaxed">
            استمتع بأفضل تجربة مشاهدة وتحميل بدون إعلانات نهائياً مع مشغل مصغر عائم على هاتفك.
          </p>
        </div>

        {/* Direct Download Action Button */}
        <div className="mb-5">
          <a
            href="/VoidTube.apk"
            download="VoidTube.apk"
            onClick={handleDownloadClick}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-neon-purple via-[#9333ea] to-[#a855f7] hover:from-[#a855f7] hover:to-[#c084fc] text-white font-extrabold text-sm sm:text-base shadow-[0_10px_35px_rgba(168,85,247,0.45)] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center group"
          >
            <Download size={20} className="group-hover:translate-y-0.5 transition-transform animate-bounce" />
            <span>تحميل ملف VoidTube.apk المباشر</span>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-black/30 font-mono font-medium">~51 MB</span>
          </a>

          {downloadStarted && (
            <div className="mt-2.5 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-fade-in bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
              <CheckCircle2 size={15} />
              <span>بدأ التنزيل الآن! تحقق من شريط الإشعارات بهاتفك.</span>
            </div>
          )}
        </div>

        {/* Key Features Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
            <span className="text-emerald-400 font-bold text-xs mb-0.5">بدون إعلانات</span>
            <span className="text-[10px] text-void-400">حجب 100% تلقائي</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
            <span className="text-neon-purple font-bold text-xs mb-0.5">MiniPlayer</span>
            <span className="text-[10px] text-void-400">مشغل مصغر عائم</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
            <span className="text-cyan-400 font-bold text-xs mb-0.5">تنزيل أوفلاين</span>
            <span className="text-[10px] text-void-400">بجودة HD كاملة</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
            <span className="text-amber-400 font-bold text-xs mb-0.5">تحديثات OTA</span>
            <span className="text-[10px] text-void-400">تحديث تلقائي فوري</span>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="space-y-2 mb-5 text-right">
          <h4 className="text-xs font-bold text-void-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap size={13} className="text-amber-400" />
            <span>خطوات التثبيت السريعة:</span>
          </h4>
          
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-void-200">
            <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">1</span>
            <span>اضغط على الزر البنفسجي أعلاه لتحميل ملف <strong className="text-white">VoidTube.apk</strong>.</span>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-void-200">
            <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">2</span>
            <span>افتح الملف من شريط الإشعارات أو مجلد <strong className="text-white">Downloads</strong>.</span>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-void-200">
            <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">3</span>
            <span>اضغط <strong className="text-emerald-400">تثبيت (Install)</strong>، وإذا ظهر تنبيه اسمح بالتثبيت من المتصفح.</span>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="flex items-center justify-between pt-3.5 border-t border-white/5 text-[11px] text-void-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck size={14} />
            <span>آمن 100% ومفحوص وخالي من أي برمجيات تتبع</span>
          </span>
          <span className="font-mono text-void-400">Android 7.0+</span>
        </div>

      </div>
    </div>
  );
}
