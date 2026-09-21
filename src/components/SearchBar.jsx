import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, ArrowUpRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import api from '../services/api';

export default function SearchBar() {
  const { nav, navigateToSearch, recentSearches, removeRecentSearch, clearRecentSearches } = useApp();
  const [query, setQuery] = useState(nav.query || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Synchronize input with current query if navigation changes
  useEffect(() => {
    if (nav.page === 'search') {
      setQuery(nav.query || '');
    }
  }, [nav.page, nav.query]);

  // Fetch suggestions as user types
  useEffect(() => {
    clearTimeout(debounceTimerRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const list = await api.getSuggestions(query);
        setSuggestions(list || []);
      } catch (err) {
        setSuggestions([]);
      }
    }, 180);

    return () => clearTimeout(debounceTimerRef.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global shortcut '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectSuggestion = (text) => {
    setQuery(text);
    setIsOpen(false);
    navigateToSearch(text);
    inputRef.current?.blur();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelectSuggestion(suggestions[selectedIndex]);
      return;
    }
    if (query.trim()) {
      setIsOpen(false);
      navigateToSearch(query.trim());
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const max = suggestions.length > 0 ? suggestions.length : recentSearches.length;
      setSelectedIndex(prev => (prev < max - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const max = suggestions.length > 0 ? suggestions.length : recentSearches.length;
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : max - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const showRecent = isOpen && !query.trim() && recentSearches.length > 0;
  const showSuggestions = isOpen && query.trim() && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto group">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-3.5 text-void-500 group-focus-within:text-neon-purple transition-colors duration-200 pointer-events-none">
          <Search size={18} strokeWidth={2.2} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          dir="auto"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder="ابحث عن فيديوهات، قنوات، موسيقى... (اضغط '/' للبحث)"
          className="w-full pl-10 pr-20 py-2.5 bg-[#141419] hover:bg-[#181822] focus:bg-[#121217] text-void-100 placeholder-void-500 text-sm rounded-full border border-void-700/80 focus:border-neon-purple/70 focus:ring-2 focus:ring-neon-purple/20 transition-all duration-200 shadow-inner"
        />

        {/* Right side buttons: Clear & Submit */}
        <div className="absolute right-2 flex items-center space-x-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-void-500 hover:text-void-100 rounded-full hover:bg-void-700/60 transition-colors"
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim()}
            className="px-3 py-1 bg-neon-purple/20 hover:bg-neon-purple/30 disabled:opacity-40 text-neon-purple hover:text-white text-xs font-semibold rounded-full transition-all duration-150"
          >
            بحث
          </button>
        </div>
      </form>

      {/* Autocomplete / Suggestions Dropdown */}
      {(showSuggestions || showRecent) && (
        <div className="absolute left-0 right-0 top-full mt-2 py-2 bg-[#121218] border border-white/[0.08] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-fade-in">
          
          {/* Live Suggestions List */}
          {showSuggestions && (
            <div className="flex flex-col">
              <div className="px-3 py-1 text-[11px] font-semibold text-void-500 flex items-center gap-1.5 border-b border-white/[0.04] mb-1">
                <Sparkles size={12} className="text-neon-purple" />
                <span>اقتراحات البحث</span>
              </div>
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  dir="auto"
                  onClick={() => handleSelectSuggestion(item)}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between gap-3 transition-colors ${
                    selectedIndex === idx
                      ? 'bg-neon-purple/20 text-white font-medium'
                      : 'text-void-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Search size={14} className="text-void-500 shrink-0" />
                    <span className="truncate">{item}</span>
                  </div>
                  <ArrowUpRight size={13} className="text-void-600 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches List */}
          {showRecent && (
            <div className="flex flex-col">
              <div className="px-3 py-1 flex items-center justify-between border-b border-white/[0.04] mb-1 text-[11px] text-void-500">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Clock size={12} />
                  <span>عمليات البحث الأخيرة</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearRecentSearches();
                  }}
                  className="text-void-500 hover:text-red-400 text-[10px] transition-colors"
                >
                  مسح الكل
                </button>
              </div>

              {recentSearches.map((term, idx) => (
                <div
                  key={idx}
                  dir="auto"
                  onClick={() => handleSelectSuggestion(term)}
                  className={`w-full px-3.5 py-2 text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    selectedIndex === idx
                      ? 'bg-neon-purple/20 text-white font-medium'
                      : 'text-void-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Clock size={14} className="text-void-500 shrink-0" />
                    <span className="truncate">{term}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(term);
                    }}
                    className="p-1 text-void-600 hover:text-void-300 rounded hover:bg-white/10"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
