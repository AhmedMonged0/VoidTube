import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, ShieldCheck } from 'lucide-react';

export default function InstallAppBanner({ onOpenApkModal }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed banner in the last 12h
    const dismissed = localStorage.getItem('voidtube_apk_banner_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed, 10) < 12 * 60 * 60 * 1000) {
      return;
    }

    // Show banner on mobile devices after 1.5 seconds
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
    const timer = setTimeout(() => {
      if (isMobile) {
        setShowBanner(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleOpenModal = () => {
    setShowBanner(false);
    if (onOpenApkModal) {
      onOpenApkModal();
    } else {
      window.dispatchEvent(new CustomEvent('voidtube-open-apk-modal'));
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('voidtube_apk_banner_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div
      dir="rtl"
      className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-[#12121c]/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.2)] p-3.5 animate-slide-up"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Icon & Details */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-950 via-[#102018] to-[#143522] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm shrink-0">
            <Smartphone size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
              <span>تطبيق VoidTube الرسمي</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500 text-black font-black">APK</span>
            </h4>
            <p className="text-[10px] sm:text-[11px] text-void-300 truncate">
              تحميل مباشر وسريع • تحديثات تلقائية بدون إعلانات
            </p>
          </div>
        </div>

        {/* Action & Close */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-extrabold text-xs shadow-md transition-all active:scale-95"
          >
            <Download size={13} strokeWidth={2.5} />
            <span>تحميل APK</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-void-500 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
