import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SearchBar() {
  const { nav, navigateToSearch } = useApp();
  const [query, setQuery] = useState(nav.query || '');
  const inputRef = useRef(null);

  // Synchronize input with current query if navigation changes
  useEffect(() => {
    if (nav.page === 'search') {
      setQuery(nav.query || '');
    }
  }, [nav.page, nav.query]);

  // Global shortcut '/' to focus search bar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigateToSearch(query.trim());
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-xl mx-auto group"
    >
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-3.5 text-void-500 group-focus-within:text-neon-purple transition-colors duration-200 pointer-events-none">
          <Search size={18} strokeWidth={2.2} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos, creators, music... (Press '/' to focus)"
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
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
