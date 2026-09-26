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
  Copy, 
  Check, 
  Apple, 
  ExternalLink 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ApkDownloadModal({ isOpen, onClose }) {
  const { CURRENT_APP_VERSION, showToast } = useApp();
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent)) {
      return 'ios';
    }
    return 'android';
  });

  const [downloadStarted, setDownloadStarted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setDownloadStarted(false);
      setCopiedLink(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    if (showToast) showToast('بدأ تحميل تطبيق VoidTube للأندرويد (APK) 🚀', 'success');
    const link = document.createElement('a');
    link.href = '/VoidTube.apk';
    link.download = 'VoidTube.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadIpa = () => {
    setDownloadStarted(true);
    if (showToast) showToast('بدأ تحميل تطبيق VoidTube للآيفون (IPA) 🍏', 'success');
    const link = document.createElement('a');
    link.href = '/VoidTube.ipa';
    link.download = 'VoidTube.ipa';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyIpaUrl = () => {
    const fullUrl = window.location.origin + '/VoidTube.ipa';
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(true);
      if (showToast) showToast('تم نسخ رابط ملف الـ IPA المباشر للـ Clipboard 📋', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    }).catch(() => {
      if (showToast) showToast('تعذر النسخ تلقائياً', 'error');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-lg bg-[#0e0e15] border border-neon-purple/40 rounded-3xl p-5 sm:p-7 shadow-[0_20px_70px_rgba(168,85,247,0.35)] overflow-hidden"
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
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-2xl bg-[#09090d] border border-neon-purple/50 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.4)] mb-3 relative overflow-hidden">
            <img src="/logo.png" alt="VoidTube App" className="w-full h-full object-cover" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[9px] font-black text-black items-center justify-center">✓</span>
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-black text-white">
              تطبيق VoidTube للهواتف
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/40 font-mono">
              v{CURRENT_APP_VERSION || '1.0.10'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-void-300 max-w-sm leading-relaxed">
            مشاهدة وتحميل بدون إعلانات نهائياً، مع تشغيل الصوت بالخلفية على شاشة القفل.
          </p>
        </div>

        {/* Platform Selector Tabs (Android vs iOS) */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-5">
          <button
            onClick={() => { setActiveTab('android'); setDownloadStarted(false); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'android'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'text-void-400 hover:text-white'
            }`}
          >
            <Smartphone size={16} />
            <span>أندرويد (APK)</span>
          </button>

          <button
            onClick={() => { setActiveTab('ios'); setDownloadStarted(false); }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'ios'
                ? 'bg-gradient-to-r from-neon-purple to-purple-600 text-white shadow-md'
                : 'text-void-400 hover:text-white'
            }`}
          >
            <span className="text-base leading-none">🍏</span>
            <span>آيفون وآيباد (IPA)</span>
          </button>
        </div>

        {/* TAB 1: ANDROID APK */}
        {activeTab === 'android' && (
          <div className="animate-fade-in">
            {/* Direct Download Action Button */}
            <div className="mb-4">
              <button
                onClick={handleDownloadApk}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-[0_10px_35px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center group"
              >
                <Download size={19} className="group-hover:translate-y-0.5 transition-transform" />
                <span>تحميل ملف VoidTube.apk المباشر</span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-black/30 font-mono font-medium">~58 MB</span>
              </button>

              {downloadStarted && (
                <div className="mt-2 text-center text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 animate-fade-in bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 size={15} />
                  <span>بدأ التحميل! ستجده في شريط إشعارات الهاتف ومجلد التنزيلات.</span>
                </div>
              )}
            </div>

            {/* Android Quick Installation Steps */}
            <div className="space-y-2 mb-4 text-right">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-void-200">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">1</span>
                <span>اضغط تحميل ملف <strong className="text-white">VoidTube.apk</strong>.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-void-200">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 font-mono">2</span>
                <span>افتح الملف من التنزيلات واضغط <strong className="text-emerald-400">تثبيت</strong>.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IOS IPA */}
        {activeTab === 'ios' && (
          <div className="animate-fade-in">
            {/* Direct Download Action Button */}
            <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
              <button
                onClick={handleDownloadIpa}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-neon-purple via-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_35px_rgba(139,92,246,0.35)] active:scale-[0.98] transition-all duration-200 cursor-pointer text-center group"
              >
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                <span>تحميل ملف VoidTube.ipa</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/30 font-mono">~112 MB</span>
              </button>

              <button
                onClick={handleCopyIpaUrl}
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs sm:text-sm font-bold transition-all active:scale-95 shrink-0"
                title="نسخ الرابط المباشر للتثبيت عبر برامج الشهادات"
              >
                {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-void-300" />}
                <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>

            {downloadStarted && (
              <div className="mb-3 text-center text-xs text-neon-purple font-bold flex items-center justify-center gap-1.5 animate-fade-in bg-neon-purple/10 py-2 rounded-xl border border-neon-purple/20">
                <CheckCircle2 size={15} />
                <span>بدأ تحميل حزمة الـ IPA! يمكنك توقيعها بشهادتك فور اكتمال التنزيل.</span>
              </div>
            )}

            {/* iOS Certificate Signing Guide */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 mb-4 text-right text-xs">
              <div className="flex items-center justify-between text-white font-bold pb-1.5 border-b border-white/[0.05]">
                <span className="flex items-center gap-1.5 text-pink-400">
                  <Sparkles size={13} />
                  <span>طريقة التثبيت بشهادتك الخاصة:</span>
                </span>
                <span className="text-[10px] font-mono text-void-400">Unsigned IPA</span>
              </div>
              <p className="text-[11px] text-void-300 leading-relaxed">
                الحزمة مهيأة لدعم <strong className="text-white">الصوت في الخلفية (Background Audio)</strong> وشاشة القفل. يمكنك توقيعها بشهادتك الشخصية أو المطورين باستخدام أدواتك المعتادة:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['ESign (إي-ساين)', 'Scarlet (سكارليت)', 'TrollStore', 'AltStore', 'Sideloadly'].map((tool, idx) => (
                  <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-void-200 border border-white/5">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Key Features Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
            <span className="text-emerald-400 font-bold text-xs mb-0.5">بدون إعلانات</span>
            <span className="text-[10px] text-void-400">حجب 100% تلقائي</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
            <span className="text-neon-purple font-bold text-xs mb-0.5">تشغيل بالخلفية</span>
            <span className="text-[10px] text-void-400">على شاشة القفل</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
            <span className="text-cyan-400 font-bold text-xs mb-0.5">تنزيل أوفلاين</span>
            <span className="text-[10px] text-void-400">بجودة HD كاملة</span>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-center flex flex-col items-center">
            <span className="text-amber-400 font-bold text-xs mb-0.5">تحديثات فورية</span>
            <span className="text-[10px] text-void-400">نظام OTA ذكي</span>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-void-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck size={14} />
            <span>آمن 100% ومفحوص وخالي من أي برمجيات تتبع</span>
          </span>
          <span className="font-mono text-void-400">Android & iOS</span>
        </div>

      </div>
    </div>
  );
}
