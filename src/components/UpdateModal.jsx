import React, { useState } from 'react';
import { Download, Rocket, AlertCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UpdateModal() {
  const { updateInfo, showUpdateModal, setShowUpdateModal } = useApp();
  const [downloading, setDownloading] = useState(false);

  if (!showUpdateModal) return null;

  const handleUpdate = () => {
    setDownloading(true);
    // Open the direct APK link in the system browser/downloader
    // This triggers the Android package installer smoothly
    window.open('https://voidtube-one.vercel.app/VoidTube.apk', '_system');
    
    // Keep it in downloading state for a few seconds to show feedback
    setTimeout(() => {
      setShowUpdateModal(false);
      setDownloading(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-fade-in"
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-[#101016] border border-neon-purple/30 shadow-[0_0_50px_rgba(139,92,246,0.15)] p-6 flex flex-col items-center text-center z-10 animate-fade-in overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-neon-purple/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-neon-purple/15 border-2 border-neon-purple/30 flex items-center justify-center text-neon-purple shadow-[0_0_30px_rgba(139,92,246,0.4)] animate-bounce mb-5">
          <Rocket size={40} className="stroke-[2.5]" />
        </div>
        
        {/* Texts */}
        <h2 className="text-xl font-black text-white mb-2 tracking-tight">
          تحديث جديد متاح! 🎉
        </h2>
        
        <p className="text-xs text-void-300 leading-relaxed max-w-[280px] mb-6">
          نسخة جديدة من <strong className="text-white">VoidTube</strong> متوفرة الآن (إصدار {updateInfo?.version}). تتضمن تحسينات جديدة ومزايا أسرع.
        </p>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleUpdate}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-neon-purple hover:bg-purple-600 text-white text-sm font-bold shadow-neon-purple transition-all active:scale-95 disabled:opacity-70"
          >
            {downloading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>جاري بدء التنزيل...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>تحديث الآن</span>
              </>
            )}
          </button>
          
          {!downloading && (
            <button
              onClick={() => setShowUpdateModal(false)}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-void-300 hover:text-white text-xs font-semibold transition-all"
            >
              لاحقاً
            </button>
          )}
        </div>
        
      </div>
    </div>
  );
}
