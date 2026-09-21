import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  WATCH_LATER: 'voidtube_watch_later_v1',
  FAVORITES: 'voidtube_favorites_v1',
  HISTORY: 'voidtube_history_v1',
};

function safeGetStorage(key, fallback = []) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Failed to read from localStorage (${key}):`, err);
    return fallback;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage (${key}):`, err);
  }
}

export function AppProvider({ children }) {
  // Navigation state: { page: 'home' | 'watch' | 'search' | 'bookmarks', videoId: string, query: string }
  const [nav, setNav] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    const query = params.get('q');
    const page = params.get('page');

    if (videoId) return { page: 'watch', videoId, query: '' };
    if (query) return { page: 'search', query, videoId: '' };
    if (page === 'bookmarks') return { page: 'bookmarks', query: '', videoId: '' };
    return { page: 'home', query: '', videoId: '' };
  });

  // Watch Later & Favorites
  const [watchLater, setWatchLater] = useState(() => safeGetStorage(STORAGE_KEYS.WATCH_LATER));
  const [favorites, setFavorites] = useState(() => safeGetStorage(STORAGE_KEYS.FAVORITES));
  const [history, setHistory] = useState(() => safeGetStorage(STORAGE_KEYS.HISTORY));

  // UI Drawers & Modals
  const [isWatchLaterOpen, setIsWatchLaterOpen] = useState(false);
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);

  // Active Invidious instance
  const [activeInstance, setActiveInstance] = useState(api.getCurrentInstance());

  // Subscribe to instance change events
  useEffect(() => {
    const unsub = api.onInstanceChange((newUrl) => {
      setActiveInstance(newUrl);
    });
    return unsub;
  }, []);

  // Listen to browser popstate (back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const videoId = params.get('v');
      const query = params.get('q');
      const page = params.get('page');

      if (videoId) {
        setNav({ page: 'watch', videoId, query: '' });
      } else if (query) {
        setNav({ page: 'search', query, videoId: '' });
      } else if (page === 'bookmarks') {
        setNav({ page: 'bookmarks', query: '', videoId: '' });
      } else {
        setNav({ page: 'home', query: '', videoId: '' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation helpers
  const navigateToHome = useCallback(() => {
    window.history.pushState({}, '', window.location.pathname);
    setNav({ page: 'home', query: '', videoId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToWatch = useCallback((videoId, videoData = null) => {
    if (!videoId) return;
    window.history.pushState({}, '', `?v=${videoId}`);
    setNav({ page: 'watch', videoId, query: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Also record in recent watch history if data provided
    if (videoData) {
      setHistory(prev => {
        const filtered = prev.filter(v => (v.videoId || v.id) !== videoId);
        const updated = [videoData, ...filtered].slice(0, 50);
        safeSetStorage(STORAGE_KEYS.HISTORY, updated);
        return updated;
      });
    }
  }, []);

  const navigateToSearch = useCallback((query) => {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    window.history.pushState({}, '', `?q=${encodeURIComponent(cleanQuery)}`);
    setNav({ page: 'search', query: cleanQuery, videoId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToBookmarks = useCallback(() => {
    window.history.pushState({}, '', `?page=bookmarks`);
    setNav({ page: 'bookmarks', query: '', videoId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Watch Later actions
  const toggleWatchLater = useCallback((video) => {
    const id = video.videoId || video.id;
    if (!id) return;

    setWatchLater(prev => {
      const exists = prev.some(v => (v.videoId || v.id) === id);
      let next;
      if (exists) {
        next = prev.filter(v => (v.videoId || v.id) !== id);
      } else {
        // Standardize item representation
        const item = {
          videoId: id,
          title: video.title || 'Untitled Video',
          author: video.author || video.authorName || 'Unknown Channel',
          lengthSeconds: video.lengthSeconds || 0,
          viewCount: video.viewCount || video.viewCountText || 0,
          publishedText: video.publishedText || '',
          videoThumbnails: video.videoThumbnails || [],
          savedAt: Date.now()
        };
        next = [item, ...prev];
      }
      safeSetStorage(STORAGE_KEYS.WATCH_LATER, next);
      return next;
    });
  }, []);

  const isWatchLater = useCallback((videoId) => {
    if (!videoId) return false;
    return watchLater.some(v => (v.videoId || v.id) === videoId);
  }, [watchLater]);

  const removeWatchLater = useCallback((videoId) => {
    setWatchLater(prev => {
      const next = prev.filter(v => (v.videoId || v.id) !== videoId);
      safeSetStorage(STORAGE_KEYS.WATCH_LATER, next);
      return next;
    });
  }, []);

  const clearAllWatchLater = useCallback(() => {
    setWatchLater([]);
    safeSetStorage(STORAGE_KEYS.WATCH_LATER, []);
  }, []);

  // Switch Invidious Instance
  const switchInstance = useCallback((url) => {
    api.setCurrentInstance(url);
    setActiveInstance(url);
  }, []);

  return (
    <AppContext.Provider
      value={{
        nav,
        navigateToHome,
        navigateToWatch,
        navigateToSearch,
        navigateToBookmarks,
        watchLater,
        toggleWatchLater,
        isWatchLater,
        removeWatchLater,
        clearAllWatchLater,
        isWatchLaterOpen,
        setIsWatchLaterOpen,
        isInstanceModalOpen,
        setIsInstanceModalOpen,
        activeInstance,
        switchInstance,
        history,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
