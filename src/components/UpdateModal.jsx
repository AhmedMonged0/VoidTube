import React, { useState } from 'react';
import { Download, Rocket, AlertCircle, RefreshCw, Smartphone, Apple } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Capacitor } from '@capacitor/core';

export default function UpdateModal() {
  const { updateInfo, showUpdateModal, setShowUpdateModal } = useApp();
  const [downloading, setDownloading] = useState(false);

  // Auto-detect platform: iOS vs Android
  const isIOS = typeof window !== 'undefined' && (
    (typeof Capacitor !== 'undefined' && Capacitor.getPlatform && Capacitor.getPlatform() === 'ios') ||
    /iPhone|iPad|iPod/i.test(navigator.userAgent)
  );

  const [platform, setPlatform] = useState(isIOS ? 'ios' : 'android');

  if (!showUpdateModal) return null;

  const handleUpdate = () => {
    setDownloading(true);
    const targetUrl = platform === 'ios'
      ? (updateInfo?.ipaUrl || '/VoidTube.ipa')
      : (updateInfo?.apkUrl || '/VoidTube.apk');

    const downloadFileName = platform === 'ios' ? 'VoidTube.ipa' : 'VoidTube.apk';

    try {
      const link = document.createElement('a');
      link.href = targetUrl;
      link.setAttribute('download', downloadFileName);
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {}

    try {
      window.open(targetUrl, '_system');
    } catch (e) {}

    setTimeout(() => {
      setShowUpdateModal(false);
      setDownloading(false);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-fade-in"
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#101016] border border-neon-purple/40 shadow-[0_0_50px_rgba(139,92,246,0.2)] p-6 flex flex-col items-center text-center z-10 animate-fade-in overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-neon-purple/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* App Logo with Glow */}
        <div className="relative w-18 h-18 rounded-2xl bg-[#08080c] border border-neon-purple/40 shadow-[0_0_30px_rgba(139,92,246,0.4)] mb-4 overflow-hidden p-1">
          <img src="/logo.png" alt="VoidTube Update" className="w-full h-full object-cover rounded-xl" />
        </div>
        
        {/* Texts */}
        <div className="flex items-center gap-2 mb-1.5">
          <h2 className="text-xl font-black text-white tracking-tight">
            تحديث جديد متاح! 🎉
          </h2>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
            v{updateInfo?.version || '1.0.10'}
          </span>
        </div>
        
        <p className="text-xs text-void-300 leading-relaxed mb-4">
          {updateInfo?.notes || 'نسخة جديدة متوفرة الآن تتضمن تحسينات للأداء واستقرار البث.'}
        </p>

        {/* Platform Selector */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] w-full mb-5">
          <button
            onClick={() => setPlatform('android')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              platform === 'android'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-void-400 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span>أندرويد (APK)</span>
          </button>

          <button
            onClick={() => setPlatform('ios')}
            className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              platform === 'ios'
                ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/40'
                : 'text-void-400 hover:text-white'
            }`}
          >
            <span className="text-sm leading-none">🍏</span>
            <span>آيفون (IPA)</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={handleUpdate}
            disabled={downloading}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-neon-purple transition-all active:scale-95 disabled:opacity-70 ${
              platform === 'ios'
                ? 'bg-gradient-to-r from-neon-purple to-purple-600 hover:from-purple-500 hover:to-indigo-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500'
            }`}
          >
            {downloading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>جاري بدء التنزيل...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>تحديث الآن ({platform === 'ios' ? 'ملف IPA' : 'ملف APK'})</span>
              </>
            )}
          </button>
          
          {!downloading && (
            <button
              onClick={() => setShowUpdateModal(false)}
              className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-void-300 hover:text-white text-xs font-semibold transition-all"
            >
              لاحقاً
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}
