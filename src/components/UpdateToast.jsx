import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export default function UpdateToast() {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setHasUpdate(true);
    };

    window.addEventListener('voidtube-update-available', handleUpdate);
    return () => window.removeEventListener('voidtube-update-available', handleUpdate);
  }, []);

  const handleApplyUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    window.location.reload();
  };

  if (!hasUpdate) return null;

  return (
    <div
      dir="rtl"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#161622]/95 border border-neon-purple/40 text-white shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(139,92,246,0.3)] backdrop-blur-xl animate-bounce"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-neon-purple" />
        <span className="text-xs font-semibold">يتوفر تحديث جديد للتطبيق!</span>
      </div>

      <button
        onClick={handleApplyUpdate}
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-purple hover:bg-purple-600 text-white text-xs font-bold transition-all"
      >
        <RefreshCw size={12} />
        <span>تحديث فوري</span>
      </button>

      <button
        onClick={() => setHasUpdate(false)}
        className="p-1 text-void-500 hover:text-white rounded-full"
      >
        <X size={14} />
      </button>
    </div>
  );
}
