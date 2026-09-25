import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastNotification() {
  const { appToast, setAppToast } = useApp();

  if (!appToast) return null;

  const isSuccess = appToast.type === 'success';
  const isError = appToast.type === 'error';

  return (
    <div
      dir="rtl"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl animate-fade-in transition-all max-w-[90vw] sm:max-w-md ${
        isSuccess
          ? 'bg-[#101914]/95 border-emerald-500/40 text-emerald-200 shadow-[0_10px_30px_rgba(16,185,129,0.2)]'
          : isError
          ? 'bg-[#1c1214]/95 border-red-500/40 text-red-200 shadow-[0_10px_30px_rgba(239,68,68,0.2)]'
          : 'bg-[#151324]/95 border-neon-purple/40 text-purple-200 shadow-[0_10px_30px_rgba(139,92,246,0.2)]'
      }`}
    >
      <div className="shrink-0">
        {isSuccess ? (
          <CheckCircle2 size={18} className="text-emerald-400" />
        ) : isError ? (
          <AlertCircle size={18} className="text-red-400" />
        ) : (
          <Info size={18} className="text-neon-purple" />
        )}
      </div>

      <span className="text-xs sm:text-sm font-semibold tracking-wide flex-1">
        {appToast.message}
      </span>

      <button
        onClick={() => setAppToast(null)}
        className="p-1 rounded-full text-void-400 hover:text-white transition-colors shrink-0"
      >
        <X size={15} />
      </button>
    </div>
  );
}
