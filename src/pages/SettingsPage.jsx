import React, { useState, useRef } from 'react';
import { 
  Settings, 
  Server, 
  Globe, 
  Sliders, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw, 
  Zap, 
  Wifi, 
  PlayCircle, 
  Check, 
  ShieldCheck, 
  ArrowRight, 
  ChevronLeft, 
  Sparkles, 
  Smartphone, 
  HardDrive, 
  EyeOff, 
  Palette, 
  Gauge, 
  Layers,
  Database,
  Info,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useApp, REGIONS } from '../context/AppContext';
import { INVIDIOUS_INSTANCES } from '../services/instances';
import api from '../services/api';

const QUALITY_OPTIONS = [
  { id: 'auto', label: 'تلقائي (Auto)', desc: 'يتكيف تلقائياً مع سرعة الاتصال' },
  { id: '1080p', label: '1080p (Full HD)', desc: 'أعلى دقة نقاء ووضوح فائق' },
  { id: '720p', label: '720p (HD)', desc: 'التوازن المثالي بين الجودة والسرعة' },
  { id: '480p', label: '480p (SD)', desc: 'توفير استهلاك البيانات مع وضوح جيد' },
  { id: '360p', label: '360p (سريع)', desc: 'أقل استهلاك ممكن ومناسب للشبكات الضعيفة' },
];

const SPEED_OPTIONS = [
  { val: 0.75, label: '0.75x' },
  { val: 1.0, label: '1.0x (عادي)' },
  { val: 1.25, label: '1.25x' },
  { val: 1.5, label: '1.5x' },
  { val: 2.0, label: '2.0x' },
];

export default function SettingsPage() {
  const {
    navigateToHome,
    activeInstance,
    switchInstance,
    region,
    setRegion,
    defaultQuality,
    setDefaultQuality,
    dataSaver,
    toggleDataSaver,
    autoplayNext,
    toggleAutoplayNext,
    playbackSpeed,
    setPlaybackSpeed,
    history,
    clearHistory,
    recentSearches,
    clearRecentSearches,
    watchLater,
    downloads,
    clearAppCache,
    exportBackupData,
    importBackupData,
    checkForUpdates,
    showToast,
    CURRENT_APP_VERSION,
  } = useApp();

  const [pings, setPings] = useState({});
  const [isPinging, setIsPinging] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [customInstanceUrl, setCustomInstanceUrl] = useState('');
  const [showCustomInstanceInput, setShowCustomInstanceInput] = useState(false);
  const fileInputRef = useRef(null);

  // Test Latency across known Invidious nodes
  const handleTestPings = async () => {
    setIsPinging(true);
    const results = {};
    for (const inst of INVIDIOUS_INSTANCES) {
      try {
        const res = await api.pingInstance(inst.url);
        results[inst.url] = res;
      } catch (err) {
        results[inst.url] = { ok: false, latency: 9999 };
      }
    }
    setPings(results);
    setIsPinging(false);
    showToast('اكتمل فحص سرعة واستجابة السيرفرات ⚡', 'info');
  };

  // Switch instance with instant feedback
  const handleSwitchInstance = (url) => {
    switchInstance(url);
  };

  // Add custom instance URL
  const handleApplyCustomInstance = (e) => {
    e.preventDefault();
    let url = customInstanceUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    url = url.replace(/\/+$/, '');
    switchInstance(url);
    setCustomInstanceUrl('');
    setShowCustomInstanceInput(false);
  };

  // Handle manual update check
  const handleManualUpdate = async () => {
    setCheckingUpdate(true);
    await checkForUpdates(true);
    setTimeout(() => setCheckingUpdate(false), 1200);
  };

  // Trigger file upload for JSON import
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      importBackupData(file);
    }
  };

  // Open APK modal
  const handleOpenApk = () => {
    window.dispatchEvent(new CustomEvent('voidtube-open-apk-modal'));
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-6 px-3 sm:px-4 text-right animate-fade-in" dir="rtl">
      
      {/* 1. Page Header & Breadcrumb */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-void-400 mb-1.5">
            <button 
              onClick={navigateToHome} 
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              الرئيسية
            </button>
            <ChevronLeft size={13} className="text-void-600" />
            <span className="text-neon-purple font-bold">الإعدادات والتخصيص</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-neon-purple/30 to-purple-600/20 border border-neon-purple/40 flex items-center justify-center text-neon-purple shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Settings size={22} className="animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                لوحة التحكم والإعدادات
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Ultra Fast
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-void-400 mt-0.5">
                تخصيص مشغل الفيديو، سيرفرات البث، تفضيلات العرض، والنسخ الاحتياطي
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={navigateToHome}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-void-200 hover:text-white transition-all duration-200 active:scale-95"
        >
          <ArrowRight size={15} />
          <span>الرجوع للشاشة الرئيسية</span>
        </button>
      </div>

      {/* Settings Cards Grid */}
      <div className="flex flex-col gap-6">

        {/* ========================================================
            CARD 1: STREAMING NETWORK & INVIDIOUS CLUSTER
           ======================================================== */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/[0.07] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neon-purple/15 text-neon-purple border border-neon-purple/30 flex items-center justify-center shadow-sm">
                <Wifi size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  سيرفرات البث وشبكة Invidious
                  <span className="text-[10px] text-neon-purple font-semibold bg-neon-purple/10 px-2 py-0.5 rounded-full border border-neon-purple/20">
                    عقد عالمية
                  </span>
                </h2>
                <p className="text-xs text-void-400">اختر السيرفر الأقرب والأسرع لبث الفيديوهات والصوتيات بدون أي حجب</p>
              </div>
            </div>

            {/* Latency Test Button */}
            <button
              onClick={handleTestPings}
              disabled={isPinging}
              className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-neon-purple/15 hover:bg-neon-purple/25 border border-neon-purple/30 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            >
              <RefreshCw size={13} className={`text-neon-purple ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'جارٍ قياس السرعة...' : 'اختبار سرعة السيرفرات'}</span>
            </button>
          </div>

          {/* Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {INVIDIOUS_INSTANCES.map((inst) => {
              const isActive = activeInstance === inst.url;
              const pingInfo = pings[inst.url];

              return (
                <button
                  key={inst.url}
                  onClick={() => handleSwitchInstance(inst.url)}
                  className={`relative p-3.5 rounded-2xl border text-right transition-all duration-200 flex flex-col justify-between gap-2.5 ${
                    isActive
                      ? 'bg-gradient-to-b from-neon-purple/20 to-neon-purple/5 border-neon-purple/60 shadow-[0_0_15px_rgba(139,92,246,0.25)] ring-1 ring-neon-purple/40'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.07] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xl">{inst.flag}</span>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        <Check size={11} />
                        متصل حالياً
                      </span>
                    ) : (
                      <span className="text-[10px] text-void-500 font-mono">
                        {inst.region}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide">{inst.name}</h3>
                    <p className="text-[11px] text-void-400 font-mono truncate mt-0.5" dir="ltr">
                      {inst.url.replace(/^https?:\/\//, '')}
                    </p>
                  </div>

                  {/* Ping Badge if tested */}
                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between w-full">
                    <span className="text-[10px] text-void-400">زمن الاستجابة:</span>
                    {pingInfo ? (
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        pingInfo.ok && pingInfo.latency < 500
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : pingInfo.ok
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-red-400 bg-red-500/10'
                      }`}>
                        {pingInfo.ok ? `${pingInfo.latency}ms` : 'غير مستقر'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-void-500 font-mono">لم يُفحص</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Server Toggle / Input */}
          <div className="pt-2">
            {!showCustomInstanceInput ? (
              <button
                onClick={() => setShowCustomInstanceInput(true)}
                className="text-xs font-semibold text-void-400 hover:text-neon-purple transition-colors flex items-center gap-1.5"
              >
                <span>+ إضافة سيرفر Invidious مخصص (Custom Instance)</span>
              </button>
            ) : (
              <form onSubmit={handleApplyCustomInstance} className="flex items-center gap-2 max-w-lg mt-2">
                <input
                  type="text"
                  value={customInstanceUrl}
                  onChange={(e) => setCustomInstanceUrl(e.target.value)}
                  placeholder="https://invidious.example.com"
                  dir="ltr"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-void-500 focus:outline-none focus:border-neon-purple font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neon-purple text-white text-xs font-bold hover:bg-neon-purple/90 transition-all shadow-sm"
                >
                  تطبيق
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInstanceInput(false)}
                  className="px-3 py-2 rounded-xl bg-white/[0.05] text-void-400 hover:text-white text-xs transition-all"
                >
                  إلغاء
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ========================================================
            CARD 2: REGIONAL CONTENT & TRENDING LOCATION
           ======================================================== */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/[0.07]">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shadow-sm">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                المنطقة الجغرافية للمحتوى الرائج (Feed Region)
              </h2>
              <p className="text-xs text-void-400">حدد الدولة التي ترغب في عرض الفيديوهات الأكثر رواجاً وشهرة منها</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {REGIONS.map((r) => {
              const isSelected = region === r.code;
              return (
                <button
                  key={r.code}
                  onClick={() => {
                    setRegion(r.code);
                    showToast(`تم تعيين المنطقة إلى ${r.name} ${r.flag}`, 'success');
                  }}
                  className={`p-3 rounded-2xl border text-right flex items-center gap-3 transition-all duration-200 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)] ring-1 ring-cyan-500/40 text-white'
                      : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.07] text-void-300 hover:text-white'
                  }`}
                >
                  <span className="text-2xl">{r.flag}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold truncate">{r.name}</h3>
                    <p className="text-[10px] text-void-400 font-mono mt-0.5">{r.code}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white shrink-0">
                      <Check size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            CARD 3: PLAYER ENGINE & STREAMING PREFERENCES
           ======================================================== */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/[0.07]">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 border border-pink-500/30 flex items-center justify-center shadow-sm">
              <Sliders size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                تفضيلات مشغل الفيديو والصوت
              </h2>
              <p className="text-xs text-void-400">تحكم بالجودة الافتراضية، التوفير، وسرعة البث التلقائية</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            
            {/* 1. Default Quality Segmented Selector */}
            <div>
              <label className="text-xs font-bold text-white block mb-2">
                الجودة الافتراضية لبدء الفيديوهات
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {QUALITY_OPTIONS.map((q) => {
                  const isSelected = defaultQuality === q.id;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setDefaultQuality(q.id);
                        showToast(`تم ضبط الجودة الافتراضية: ${q.label}`, 'info');
                      }}
                      className={`p-2.5 rounded-xl border text-right transition-all duration-150 ${
                        isSelected
                          ? 'bg-neon-purple/20 border-neon-purple text-white shadow-sm font-bold'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.07] text-void-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{q.label}</span>
                        {isSelected && <Check size={13} className="text-neon-purple" />}
                      </div>
                      <p className="text-[10px] text-void-400 mt-1 line-clamp-1">{q.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Playback Speed Selector */}
            <div className="pt-4 border-t border-white/[0.05]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-white">
                  سرعة التشغيل الافتراضية
                </label>
                <span className="text-xs font-mono font-bold text-neon-purple">{playbackSpeed}x</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SPEED_OPTIONS.map((s) => (
                  <button
                    key={s.val}
                    onClick={() => setPlaybackSpeed(s.val)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      playbackSpeed === s.val
                        ? 'bg-white text-black shadow-md'
                        : 'bg-white/[0.04] text-void-300 hover:text-white border border-white/5'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Toggles: Data Saver & Autoplay Next */}
            <div className="pt-4 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Data Saver Toggle */}
              <div 
                onClick={toggleDataSaver}
                className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">وضع توفير البيانات (Data Saver)</span>
                    {dataSaver && (
                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                        مفعّل
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-void-400 mt-0.5">
                    يحد دقة الفيديو إلى 480p لتقليل استهلاك باقة الإنترنت على الموبايل
                  </p>
                </div>
                
                {/* Switch Graphic */}
                <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  dataSaver ? 'bg-amber-500' : 'bg-white/10'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    dataSaver ? '-translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Autoplay Next Toggle */}
              <div 
                onClick={toggleAutoplayNext}
                className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] flex items-center justify-between gap-3 cursor-pointer transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">التشغيل التلقائي (Autoplay)</span>
                    {autoplayNext && (
                      <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        مفعّل
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-void-400 mt-0.5">
                    تشغيل الفيديو التالي تلقائياً عند انتهاء الفيديو الحالي
                  </p>
                </div>

                {/* Switch Graphic */}
                <div className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
                  autoplayNext ? 'bg-emerald-500' : 'bg-white/10'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    autoplayNext ? '-translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

            </div>

          </div>
        </div>


        {/* ========================================================
            CARD 5: PRIVACY, BACKUP & STORAGE HUB
           ======================================================== */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/[0.07]">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.06]">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-sm">
              <Database size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                الخصوصية، إدارة البيانات، والنسخ الاحتياطي
              </h2>
              <p className="text-xs text-void-400">تحكم كامل ببياناتك المحلية، تصدير واسترجاع المفضلة بنقرة واحدة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            
            {/* 1. Fast Cache Cleaner */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                  <Zap size={14} className="text-amber-400" />
                  <span>الذاكرة المؤقتة (Cache)</span>
                </div>
                <p className="text-[11px] text-void-400">
                  تفريغ الذاكرة العشوائية لتسريع استجابة التطبيق وحل مشكلات التحميل
                </p>
              </div>
              <button
                onClick={clearAppCache}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95"
              >
                تفريغ الذاكرة المؤقتة ⚡
              </button>
            </div>

            {/* 2. Clear Watch History */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between text-white font-bold text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <Trash2 size={14} className="text-red-400" />
                    <span>سجل المشاهدة</span>
                  </div>
                  <span className="text-[10px] text-void-400 font-mono">
                    {history?.length || 0} فيديو
                  </span>
                </div>
                <p className="text-[11px] text-void-400">
                  حذف قائمة الفيديوهات التي قمت بمشاهدتها مسبقاً من الجهاز
                </p>
              </div>
              <button
                onClick={clearHistory}
                disabled={!history || history.length === 0}
                className="w-full py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
              >
                مسح السجل بالكامل
              </button>
            </div>

            {/* 3. Clear Recent Searches */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between text-white font-bold text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <EyeOff size={14} className="text-void-400" />
                    <span>سجل عمليات البحث</span>
                  </div>
                  <span className="text-[10px] text-void-400 font-mono">
                    {recentSearches?.length || 0} عملية
                  </span>
                </div>
                <p className="text-[11px] text-void-400">
                  تنظيف الكلمات والجمل التي تم البحث عنها في الشريط العلوي
                </p>
              </div>
              <button
                onClick={clearRecentSearches}
                disabled={!recentSearches || recentSearches.length === 0}
                className="w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-void-200 hover:text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
              >
                مسح سجل البحث
              </button>
            </div>

          </div>

          {/* Backup & Restore Action Buttons */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-neon-purple/10 to-cyan-500/10 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database size={14} className="text-neon-purple" />
                النسخ الاحتياطي السحابي / المحلي (Backup & Restore)
              </h3>
              <p className="text-[11px] text-void-300 mt-0.5">
                احفظ فيديوهاتك المفضلة وسجلك في ملف JSON مشفر لاستعادتها على أي جهاز آخر
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                onClick={exportBackupData}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/40 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <Download size={13} className="text-neon-purple" />
                <span>تصدير نسخة JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              >
                <Upload size={13} className="text-cyan-400" />
                <span>استيراد نسخة</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

        </div>

        {/* ========================================================
            CARD 6: ABOUT VOIDTUBE, RELEASE & UPDATES
           ======================================================== */}
        <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-black border border-white/15 p-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] shrink-0">
              <img src="/logo.png" alt="VoidTube" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-tight">VoidTube Native</h3>
                <span className="text-[11px] font-mono font-bold text-neon-purple bg-neon-purple/15 border border-neon-purple/30 px-2 py-0.5 rounded-full">
                  v{CURRENT_APP_VERSION}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  مستقر
                </span>
              </div>
              <p className="text-xs text-void-400 mt-1 max-w-md">
                مشغل يوتيوب حر، مستقل ومفتوح المصدر بدون إعلانات وبأعلى معايير الخصوصية والسرعة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleManualUpdate}
              disabled={checkingUpdate}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neon-purple/15 hover:bg-neon-purple/25 border border-neon-purple/30 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={13} className={`text-neon-purple ${checkingUpdate ? 'animate-spin' : ''}`} />
              <span>{checkingUpdate ? 'جارٍ التحقق...' : 'فحص التحديثات'}</span>
            </button>

            <button
              onClick={handleOpenApk}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-400 hover:text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="تحميل تطبيق الأندرويد"
            >
              <Smartphone size={14} className="text-emerald-400" />
              <span>تحميل APK (أندرويد)</span>
            </button>

            <button
              onClick={handleOpenApk}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-neon-purple/20 to-indigo-500/20 hover:from-neon-purple/30 hover:to-indigo-500/30 border border-neon-purple/40 text-neon-purple hover:text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
              title="تحميل تطبيق الآيفون"
            >
              <span className="text-xs leading-none">🍏</span>
              <span>تحميل IPA (آيفون)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
