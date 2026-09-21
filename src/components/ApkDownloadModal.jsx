import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2, ShieldCheck, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';

export default function ApkDownloadModal({ isOpen, onClose }) {
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDownloadStarted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadClick = () => {
    setDownloadStarted(true);
    // Trigger download programmatically as well to be 100% reliable
    const link = document.createElement('a');
    link.href = '/VoidTube.apk';
    link.download = 'VoidTube.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" dir="rtl">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg bg-[#121218] border border-neon-purple/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-neon-purple/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-void-400 hover:text-white transition-all"
        >
          <X size={20} />
        </button>

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1f1635] to-[#2e1d52] border border-neon-purple/40 flex items-center justify-center shadow-neon-purple mb-4 relative">
            <Smartphone size={32} className="text-neon-purple" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-black text-black items-center justify-center">✓</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            تحميل تطبيق VoidTube للأندرويد
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/40">
              APK رسمي
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-void-300 mt-1.5 max-w-sm leading-relaxed">
            استمتع بأفضل تجربة مشاهدة وتحميل غير محدود وبدون أي إعلانات مزعجة مباشرة على هاتفك.
          </p>
        </div>

        {/* Direct Download Action Button */}
        <div className="mb-6">
          <a
            href="/VoidTube.apk"
            download="VoidTube.apk"
            onClick={handleDownloadClick}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-neon-purple via-[#8b2ef2] to-[#a855f7] hover:from-[#9333ea] hover:to-[#c084fc] text-white font-extrabold text-base shadow-[0_10px_30px_-5px_rgba(168,85,247,0.5)] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center"
          >
            <Download size={22} className="animate-bounce" />
            <span>تحميل ملف VoidTube.apk مباشرة</span>
            <span className="text-xs px-2 py-0.5 rounded-lg bg-black/30 font-mono font-medium">5.1 MB</span>
          </a>

          {downloadStarted && (
            <div className="mt-2 text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-1.5 animate-fade-in">
              <CheckCircle2 size={14} />
              بدأ التنزيل الآن! تحقق من شريط الإشعارات بهاتفك.
            </div>
          )}
        </div>

        {/* Live Auto-Updates Feature Highlight (OTA) */}
        <div className="p-4 rounded-2xl bg-[#171722] border border-emerald-500/20 mb-6 flex items-start gap-3 text-right">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
            <RefreshCw size={18} className="animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>تحديثات تلقائية فورية (Live Auto-Update)</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">تلقائي</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-void-300 mt-1 leading-relaxed">
              هذا التطبيق متصل بسيرفرنا السحابي مباشرة. عند إضافة أي ميزة أو خادم جديد، سيتم تحديث التطبيق لديك فوراً وبشكل تلقائي دون الحاجة لإعادة تحميل الـ APK في كل مرة!
            </p>
          </div>
        </div>

        {/* Installation Steps */}
        <div className="space-y-2.5 mb-6 text-right">
          <h4 className="text-xs font-bold text-void-400 uppercase tracking-wider mb-2">
            خطوات التثبيت السريعة على الموبايل:
          </h4>
          
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-void-200">
            <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple font-bold flex items-center justify-center text-[11px] shrink-0">1</span>
            <span>اضغط على زر التحميل باللون البنفسجي أعلاه لحفظ ملف <strong className="text-white">VoidTube.apk</strong>.</span>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-void-200">
            <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple font-bold flex items-center justify-center text-[11px] shrink-0">2</span>
            <span>افتح الملف بعد اكتمال التحميل من شريط الإشعارات أو مجلد <strong className="text-white">Downloads</strong>.</span>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-void-200">
            <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple font-bold flex items-center justify-center text-[11px] shrink-0">3</span>
            <span>اختر <strong className="text-emerald-400">تثبيت (Install)</strong>، وإذا ظهر تحذير الأمان اختر <strong className="text-white">السماح بالتثبيت من هذا المصدر</strong>.</span>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] text-void-400">
          <span className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            آمن 100% ومفحوص وخالي من الإعلانات
          </span>
          <span className="font-mono text-void-500">v2.2.0 • Android 8.0+</span>
        </div>

      </div>
    </div>
  );
}
