import React from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Download, 
  Play, 
  Bookmark, 
  History, 
  SlidersHorizontal, 
  Flame, 
  Sparkles, 
  Heart,
  Layers,
  Globe2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Footer({ onOpenApkModal }) {
  const { 
    navigateToHome, 
    navigateToBookmarks, 
    setIsDownloadsOpen, 
    toggleSidebar, 
    CURRENT_APP_VERSION,
    watchLater,
    downloads 
  } = useApp();

  const handleOpenApk = () => {
    if (onOpenApkModal) {
      onOpenApkModal();
    } else {
      window.dispatchEvent(new CustomEvent('voidtube-open-apk-modal'));
    }
  };

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#07070a] relative overflow-hidden mt-20" dir="rtl">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10">
        
        {/* Top Feature Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#14141f] via-[#101018] to-[#14141f] border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.5)] mb-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-right">
            <div className="w-14 h-14 rounded-2xl bg-[#0a0a0e] border border-neon-purple/40 flex items-center justify-center shadow-neon-purple shrink-0 overflow-hidden">
              <img src="/logo.png" alt="VoidTube" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-white">تطبيق VoidTube للأندرويد</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v{CURRENT_APP_VERSION} متوفر الآن
                </span>
              </div>
              <p className="text-xs sm:text-sm text-void-300 mt-1 max-w-xl">
                حمّل التطبيق الرسمي لهاتفك وتمتّع بالمشغل المصغر العائم، التمرير اللانهائي، وتنزيل الفيديوهات للمشاهدة بدون إنترنت وبدون إعلانات نهائياً!
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenApk}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-neon-purple to-[#a855f7] hover:from-[#9333ea] hover:to-[#c084fc] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(168,85,247,0.4)] active:scale-95 transition-all duration-200 shrink-0 group"
          >
            <Smartphone size={18} className="group-hover:scale-110 transition-transform" />
            <span>تحميل ملف APK للهاتف</span>
            <Download size={16} className="animate-bounce" />
          </button>
        </div>

        {/* 4-Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-white/[0.06]">
          
          {/* Col 1: Brand & Bio */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#09090d] border border-neon-purple/40 flex items-center justify-center shadow-glow-sm overflow-hidden">
                <img src="/logo.png" alt="VoidTube" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                VoidTube
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neon-purple/20 text-neon-purple border border-neon-purple/30 font-bold">
                  OLED
                </span>
              </span>
            </div>
            <p className="text-xs text-void-400 leading-relaxed">
              مشغل الفيديوهات المظلم فائق السرعة والمصمم لتقديم تجربة نقية تماماً، بدون إعلانات مزعجة، وبدون شورتس تشتت انتباهك. خصوصية وأداء غير مسبوقين.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                <ShieldCheck size={12} />
                بدون إعلانات وتتبع
              </span>
              <span className="flex items-center gap-1 text-[11px] text-neon-purple bg-neon-purple/10 px-2 py-0.5 rounded-full border border-neon-purple/20 font-medium">
                <Zap size={12} />
                خوادم فائقة
              </span>
            </div>
          </div>

          {/* Col 2: Core Features */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={14} className="text-neon-purple" />
              <span>أبرز المميزات</span>
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-void-300">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-purple shrink-0" />
                <span>مشغل مصغر عائم (MiniPlayer) مثل يوتيوب</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>تنزيل الفيديوهات لمشاهدتها بدون إنترنت</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span>تمرير لا نهائي تلقائي بدون أزرار</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                <span>اقتراحات بحث حية وفورية بالعربية والإنجليزية</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                <span>تصميم OLED داكن ومريح للعين والبطارية</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} className="text-emerald-400" />
              <span>أقسام التطبيق السريعة</span>
            </h4>
            <ul className="flex flex-col gap-2 text-xs text-void-300">
              <li>
                <button
                  onClick={navigateToHome}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Play size={12} className="text-neon-purple" />
                  <span>الصفحة الرئيسية والاستكشاف</span>
                </button>
              </li>
              <li>
                <button
                  onClick={navigateToBookmarks}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Bookmark size={12} className="text-amber-400" />
                  <span>قائمة المشاهدة لاحقاً ({watchLater.length})</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsDownloadsOpen(true)}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <Download size={12} className="text-emerald-400" />
                  <span>التنزيلات المحفوظة ({downloads.length})</span>
                </button>
              </li>
              <li>
                <button
                  onClick={toggleSidebar}
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <SlidersHorizontal size={12} className="text-void-400" />
                  <span>مركز الإعدادات والتحكم بالخوادم</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Architecture */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe2 size={14} className="text-cyan-400" />
              <span>التقنيات والأمان</span>
            </h4>
            <p className="text-xs text-void-400 leading-relaxed">
              يعتمد التطبيق على شبكة خوادم Invidious اللامركزية مع دعم تقنية Capacitor لتشغيل أصلي كامل على هواتف أندرويد وتطبيق الويب التقدمي (PWA).
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] text-void-300 font-mono">React 19</span>
              <span className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] text-void-300 font-mono">Vite</span>
              <span className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] text-void-300 font-mono">Capacitor 8</span>
              <span className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-[10px] text-void-300 font-mono">TailwindCSS</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Version info */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-void-400">
          <div className="flex items-center gap-2">
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
            <strong className="text-white font-extrabold tracking-wide">VoidTube</strong>
            <span>•</span>
            <span className="text-void-400">تجربة مشاهدة حرة ومستقلة</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-void-400 bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/5">
              الإصدار: v{CURRENT_APP_VERSION}
            </span>
            <span className="flex items-center gap-1 text-void-400 text-xs">
              صُنع بكل <Heart size={12} className="text-neon-crimson fill-neon-crimson" /> لعشاق المحتوى الهادف
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
