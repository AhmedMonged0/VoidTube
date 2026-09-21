import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Sparkles, Check, ArrowDownToLine, Share, PlusSquare } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed as PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed banner in the last 24h
    const dismissed = localStorage.getItem('voidtube_install_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleOpenFromHeader = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowGuideModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('voidtube-open-install-guide', handleOpenFromHeader);

    // Also show banner on mobile devices after 2 seconds
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const timer = setTimeout(() => {
      if (isMobile && !isInstalled) {
        setShowBanner(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('voidtube-open-install-guide', handleOpenFromHeader);
      clearTimeout(timer);
    };
  }, [isInstalled, deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show manual install guide modal
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('voidtube_install_dismissed', Date.now().toString());
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* Floating Mobile Install Prompt Banner */}
      <div
        dir="rtl"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#12121a]/95 backdrop-blur-xl border border-neon-purple/30 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(139,92,246,0.25)] p-4 animate-slide-up"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Icon & Details */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-950 via-[#181528] to-[#2b1f48] border border-neon-purple/40 flex items-center justify-center text-neon-purple shadow-neon-purple shrink-0">
              <Smartphone size={22} />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                <span>تطبيق VoidTube للموبايل</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-neon-purple text-white font-semibold">APK/PWA</span>
              </h4>
              <p className="text-[11px] text-void-400 truncate">
                تثبيت على الشاشة مع تحديثات تلقائية وفورية
              </p>
            </div>
          </div>

          {/* Action & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neon-purple hover:bg-purple-600 text-white text-xs font-bold shadow-neon-purple transition-all"
            >
              <ArrowDownToLine size={13} />
              <span>تثبيت</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-void-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Install Guide Modal for iOS / Browser that doesn't trigger prompt */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowGuideModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div
            dir="rtl"
            className="relative w-full max-w-sm rounded-2xl bg-[#14141c] border border-white/10 p-5 shadow-2xl flex flex-col gap-4 text-right z-10 animate-fade-in"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone size={18} className="text-neon-purple" />
                تثبيت التطبيق على هاتفك
              </h3>
              <button onClick={() => setShowGuideModal(false)} className="text-void-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-void-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-void-800/80">
                <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center shrink-0 font-bold">1</span>
                <p>اضغط على قائمة خيارات المتصفح (ثلاث نقاط <b>⋮</b> أعلى اليمين أو زر المشاركة <Share size={12} className="inline mx-1" />).</p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-void-800/80">
                <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center shrink-0 font-bold">2</span>
                <p>اختر <b>"تثبيت التطبيق" (Install App)</b> أو <b>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</b>.</p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-void-800/80">
                <span className="w-5 h-5 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center shrink-0 font-bold">3</span>
                <p>سيظهر أيقونة التطبيق على شاشة هاتفك، وسيقوم بالتحديث التلقائي المباشر مع كل ميزة جديدة دون الحاجة لإعادة التنزيل!</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-neon-purple text-white text-xs font-bold transition-all shadow-neon-purple"
            >
              فهمت، شكراً!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
