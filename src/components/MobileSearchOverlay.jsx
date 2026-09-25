import React, { useState, useEffect, useRef } from 'react';
import { Search, ArrowRight, X, Clock, ArrowUpRight, Sparkles, Flame, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

const QUICK_TRENDING_TOPICS = [
  { label: 'تريند مصر اليوم', query: 'تريند مصر' },
  { label: 'بودكاست حوارات', query: 'بودكاست مصري' },
  { label: 'ملخصات كروية', query: 'ملخص اهداف مباريات اليوم' },
  { label: 'أغاني وموسيقى', query: 'اغاني عربية جديدة' },
  { label: 'كوميديا واسكتشات', query: 'كوميديا مصرية مضحكة' },
  { label: 'وثائقيات ومعرفة', query: 'وثائقيات علمية شيقة' },
  { label: 'ألعاب وجيمينج', query: 'العاب وتحديات جيمينج' },
];

export default function MobileSearchOverlay() {
  const {
    isMobileSearchOpen,
    setIsMobileSearchOpen,
    navigateToSearch,
    recentSearches,
    removeRecentSearch,
    clearRecentSearches,
    nav,
  } = useApp();

  const [query, setQuery] = useState(nav.query || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync with current search query and focus when opened
  useEffect(() => {
    if (isMobileSearchOpen) {
      setQuery(nav.query || '');
      setSuggestions([]);
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen, nav.query]);

  // Fetch live suggestions as user types
  useEffect(() => {
    clearTimeout(debounceTimerRef.current);
    const clean = query.trim();
    if (!clean) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const list = await api.getSuggestions(clean);
        setSuggestions(Array.isArray(list) ? list : []);
      } catch (err) {
        console.warn('Failed to load suggestions:', err);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 120);

    return () => clearTimeout(debounceTimerRef.current);
  }, [query]);

  if (!isMobileSearchOpen) return null;

  const handleExecuteSearch = (targetQuery) => {
    const finalQuery = (targetQuery || query).trim();
    if (!finalQuery) return;
    setIsMobileSearchOpen(false);
    navigateToSearch(finalQuery);
  };

  const handleRefine = (e, text) => {
    e.stopPropagation();
    setQuery(text);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className="md:hidden fixed inset-0 z-50 bg-[#0a0a0f] flex flex-col animate-fade-in select-none"
      dir="rtl"
    >
      {/* Top Search Header Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#0e0e14]/95 border-b border-white/[0.08] backdrop-blur-xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setIsMobileSearchOpen(false)}
          className="p-2 rounded-full text-void-300 hover:text-white bg-white/5 active:scale-95 transition-all"
          title="رجوع"
        >
          <ArrowRight size={20} />
        </button>

        {/* Input Container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExecuteSearch();
          }}
          className="relative flex-1 flex items-center"
        >
          <input
            ref={inputRef}
            type="text"
            dir="auto"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في يوتيوب..."
            className="w-full bg-[#161622] text-white text-sm rounded-full pl-9 pr-4 py-2 border border-neon-purple/40 focus:border-neon-purple focus:outline-none focus:ring-2 focus:ring-neon-purple/20 transition-all placeholder-void-500 shadow-inner"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute left-2.5 p-1 text-void-400 hover:text-white rounded-full bg-white/5 active:scale-95"
              title="مسح"
            >
              <X size={15} />
            </button>
          )}
        </form>

        {/* Submit Search Button */}
        <button
          type="button"
          disabled={!query.trim()}
          onClick={() => handleExecuteSearch()}
          className="px-3.5 py-2 bg-neon-purple hover:bg-neon-purple/90 text-white text-xs font-bold rounded-full disabled:opacity-40 transition-all active:scale-95 shadow-neon-purple shrink-0"
        >
          بحث
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3 divide-y divide-white/[0.04]">
        {/* State A: Live Suggestions when user typed something */}
        {query.trim().length > 0 ? (
          <div className="flex flex-col">
            <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-void-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-neon-purple">
                <Sparkles size={12} />
                <span>اقتراحات البحث</span>
              </span>
              {loadingSuggestions && (
                <span className="text-[10px] text-void-500 animate-pulse">جارٍ البحث...</span>
              )}
            </div>

            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleExecuteSearch(item)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 active:bg-neon-purple/15 text-void-200 hover:text-white transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Search size={16} className="text-void-500 shrink-0 group-hover:text-neon-purple" />
                  <span className="text-sm font-medium truncate" dir="auto">
                    {item}
                  </span>
                </div>
                {/* Arrow up-left/up-right icon to paste text into input without searching */}
                <button
                  type="button"
                  onClick={(e) => handleRefine(e, item)}
                  className="p-1.5 text-void-500 hover:text-white hover:bg-white/10 rounded-lg shrink-0 ml-1 transition-all"
                  title="تعديل هذا الاقتراح"
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>
            ))}

            {!loadingSuggestions && suggestions.length === 0 && (
              <div
                onClick={() => handleExecuteSearch()}
                className="flex items-center gap-3 px-3 py-3 text-void-300 hover:text-white text-sm cursor-pointer"
              >
                <Search size={16} className="text-neon-purple" />
                <span>بحث عن &quot;{query}&quot;</span>
              </div>
            )}
          </div>
        ) : (
          /* State B: Empty Query -> Recent Searches & Quick Topics */
          <div className="flex flex-col gap-4">
            {/* 1. Recent Searches */}
            {recentSearches && recentSearches.length > 0 && (
              <div className="flex flex-col">
                <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-void-400">
                  <span className="flex items-center gap-1.5 text-void-300">
                    <Clock size={13} className="text-neon-purple" />
                    <span>عمليات البحث الأخيرة</span>
                  </span>
                  <button
                    type="button"
                    onClick={clearRecentSearches}
                    className="flex items-center gap-1 text-[10px] text-void-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={11} />
                    <span>مسح الكل</span>
                  </button>
                </div>

                {recentSearches.slice(0, 8).map((term, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleExecuteSearch(term)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 active:bg-neon-purple/15 text-void-200 hover:text-white transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Clock size={15} className="text-void-500 shrink-0 group-hover:text-neon-purple" />
                      <span className="text-sm font-medium truncate" dir="auto">
                        {term}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleRefine(e, term)}
                        className="p-1.5 text-void-500 hover:text-white rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <ArrowUpRight size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(term);
                        }}
                        className="p-1.5 text-void-500 hover:text-red-400 rounded-lg transition-colors"
                        title="حذف من السجل"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Popular Topics / Chips */}
            <div className="flex flex-col px-2 pt-2">
              <div className="px-1 py-1 flex items-center gap-1.5 text-[11px] font-bold text-void-400 uppercase tracking-wider mb-2">
                <Flame size={13} className="text-amber-400" />
                <span>المواضيع الرائجة</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TRENDING_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleExecuteSearch(topic.query)}
                    className="px-3.5 py-1.5 rounded-full bg-[#151520] hover:bg-neon-purple/20 text-void-200 hover:text-white border border-white/10 hover:border-neon-purple/40 text-xs font-semibold transition-all active:scale-95 shadow-sm"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
