import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  WATCH_LATER: 'voidtube_watch_later_v1',
  FAVORITES: 'voidtube_favorites_v1',
  HISTORY: 'voidtube_history_v1',
  REGION: 'voidtube_region_v1',
  RECENT_SEARCHES: 'voidtube_recent_searches_v1',
  DOWNLOADS: 'voidtube_offline_downloads_v1',
};

export const REGIONS = [
  { code: 'EG', name: 'مصر', flag: '🇪🇬', defaultQuery: 'تريند مصر' },
  { code: 'SA', name: 'السعودية', flag: '🇸🇦', defaultQuery: 'تريند السعودية' },
  { code: 'AR', name: 'الوطن العربي', flag: '🌍', defaultQuery: 'محتوى عربي رائج' },
  { code: 'US', name: 'Global / US', flag: '🌐', defaultQuery: 'trending' },
];

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

  // Region setting (Default to Egypt 'EG')
  const [region, setRegionState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REGION);
    return saved || 'EG';
  });

  // Recent Searches
  const [recentSearches, setRecentSearches] = useState(() => safeGetStorage(STORAGE_KEYS.RECENT_SEARCHES));

  // UI Drawers & Modals
  const [isWatchLaterOpen, setIsWatchLaterOpen] = useState(false);
  const [isInstanceModalOpen, setIsInstanceModalOpen] = useState(false);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sidebar toggle state (Default closed so page opens cleanly without sidebar popup)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);

  // Offline / In-App Saved Downloads
  const [downloads, setDownloads] = useState([]);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [downloadModalVideo, setDownloadModalVideo] = useState(null);

  // Load offline downloads from IndexedDB
  useEffect(() => {
    import('../utils/indexedDB').then(({ getVideos }) => {
      getVideos().then(vids => setDownloads(vids)).catch(console.error);
    });
  }, []);

  const openDownloadModal = useCallback((video) => {
    if (!video) return;
    setDownloadModalVideo(video);
  }, []);

  const closeDownloadModal = useCallback(() => {
    setDownloadModalVideo(null);
  }, []);

  const addDownload = useCallback((item) => {
    if (!item || !item.videoId) return;
    setDownloads(prev => {
      const filtered = prev.filter(v => v.videoId !== item.videoId);
      const updated = [{ ...item, savedAt: Date.now() }, ...filtered];
      return updated;
    });
    // Actual saving to DB happens in DownloadModal with the Blob
  }, []);

  const removeDownload = useCallback((videoId) => {
    setDownloads(prev => prev.filter(v => v.videoId !== videoId));
    import('../utils/indexedDB').then(({ getVideos, deleteVideo }) => {
      getVideos().then(vids => {
        const vid = vids.find(v => v.videoId === videoId);
        if (vid) deleteVideo(vid.id);
      });
    });
  }, []);

  const clearAllDownloads = useCallback(() => {
    setDownloads([]);
    import('../utils/indexedDB').then(({ getVideos, deleteVideo }) => {
      getVideos().then(vids => vids.forEach(v => deleteVideo(v.id)));
    });
  }, []);

  const isVideoDownloaded = useCallback((videoId) => {
    if (!videoId) return false;
    return downloads.some(v => v.videoId === videoId);
  }, [downloads]);

  // Active Invidious instance
  const [activeInstance, setActiveInstance] = useState(api.getCurrentInstance());

  // Subscribe to instance change events
  useEffect(() => {
    const unsub = api.onInstanceChange((newUrl) => {
      setActiveInstance(newUrl);
    });
    return unsub;
  }, []);

  // Set region and save
  const setRegion = useCallback((newRegion) => {
    setRegionState(newRegion);
    localStorage.setItem(STORAGE_KEYS.REGION, newRegion);
  }, []);

  // Recent searches management
  const addRecentSearch = useCallback((term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 10);
      safeSetStorage(STORAGE_KEYS.RECENT_SEARCHES, updated);
      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback((term) => {
    setRecentSearches(prev => {
      const updated = prev.filter(t => t !== term);
      safeSetStorage(STORAGE_KEYS.RECENT_SEARCHES, updated);
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    safeSetStorage(STORAGE_KEYS.RECENT_SEARCHES, []);
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
    setNav({ page: 'watch', videoId, query: '', videoData });
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
    addRecentSearch(cleanQuery);
    window.history.pushState({}, '', `?q=${encodeURIComponent(cleanQuery)}`);
    setNav({ page: 'search', query: cleanQuery, videoId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [addRecentSearch]);

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
        next = prev.filter(v => (v.videoId || v.id) === id);
      } else {
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
        region,
        setRegion,
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
        selectedCategory,
        setSelectedCategory,
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        downloads,
        isDownloadsOpen,
        setIsDownloadsOpen,
        addDownload,
        removeDownload,
        clearAllDownloads,
        isVideoDownloaded,
        downloadModalVideo,
        openDownloadModal,
        closeDownloadModal,
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
