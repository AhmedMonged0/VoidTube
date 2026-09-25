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

  // Playback & App Preferences
  const [defaultQuality, setDefaultQualityState] = useState(() => {
    return localStorage.getItem('voidtube_default_quality') || '720p';
  });

  const [dataSaver, setDataSaverState] = useState(() => {
    return localStorage.getItem('voidtube_data_saver') === 'true';
  });

  const [autoplayNext, setAutoplayNextState] = useState(() => {
    return localStorage.getItem('voidtube_autoplay_next') !== 'false';
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

  // Mini Player State (YouTube-like floating player)
  const [miniPlayer, setMiniPlayer] = useState(null); // { videoId, videoData } | null

  const showMiniPlayer = useCallback((videoId, videoData) => {
    setMiniPlayer({ videoId, videoData });
  }, []);

  const hideMiniPlayer = useCallback(() => {
    setMiniPlayer(null);
  }, []);

  const expandMiniPlayer = useCallback(() => {
    // Will navigate to watch page and close mini player
    if (miniPlayer?.videoId) {
      window.history.pushState({}, '', `?v=${miniPlayer.videoId}`);
      setNav({ page: 'watch', videoId: miniPlayer.videoId, query: '', videoData: miniPlayer.videoData });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMiniPlayer(null);
  }, [miniPlayer]);

  const [downloads, setDownloads] = useState(() => safeGetStorage(STORAGE_KEYS.DOWNLOADS, []));
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [downloadingVideos, setDownloadingVideos] = useState([]); // List of videoIds currently downloading
  
  // App Toast State
  const [appToast, setAppToast] = useState(null);
  const showToast = useCallback((message, type = 'info') => {
    setAppToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setAppToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // In-App Updater State
  const CURRENT_APP_VERSION = '1.0.6';
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const checkForUpdates = useCallback(async (manual = false) => {
    try {
      if (manual) showToast('جارٍ التحقق من وجود تحديثات...', 'info');
      const res = await fetch(`https://voidtube-one.vercel.app/version.json?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.version && data.version !== CURRENT_APP_VERSION) {
          setUpdateInfo(data);
          setShowUpdateModal(true);
        } else if (manual) {
          showToast(`أنت تستخدم أحدث إصدار بالفعل (v${CURRENT_APP_VERSION}) ✨`, 'success');
        }
      } else if (manual) {
        showToast('تعذر التحقق من التحديثات، تحقق من الاتصال', 'error');
      }
    } catch (e) {
      console.warn('Failed to check for updates', e);
      if (manual) showToast('تعذر الاتصال بخادم التحديثات', 'error');
    }
  }, [showToast]);

  // Check for updates on mount
  useEffect(() => {
    const timer = setTimeout(() => checkForUpdates(false), 3000);
    return () => clearTimeout(timer);
  }, [checkForUpdates]);

  // Load and sync offline downloads from IndexedDB with localStorage
  useEffect(() => {
    import('../utils/indexedDB').then(({ getVideos }) => {
      getVideos().then(dbVids => {
        if (Array.isArray(dbVids) && dbVids.length > 0) {
          setDownloads(prev => {
            const merged = [...prev];
            dbVids.forEach(dbV => {
              const dbId = dbV.videoId || dbV.id;
              const idx = merged.findIndex(m => (m.videoId || m.id) === dbId);
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...dbV };
              } else {
                merged.push(dbV);
              }
            });
            safeSetStorage(STORAGE_KEYS.DOWNLOADS, merged);
            return merged;
          });
        }
      }).catch(err => console.warn('IndexedDB sync error:', err));
    });
  }, []);

  const triggerBackgroundDownload = useCallback((video) => {
    if (!video) return;
    const videoId = video.videoId || video.id;
    if (!videoId || downloadingVideos.includes(videoId)) return;

    setDownloadingVideos(prev => [...prev, videoId]);
    showToast('جارٍ تجهيز رابط التنزيل بجودة 720p HD...', 'info');

    import('../utils/downloadManager').then(({ startBackgroundDownload }) => {
      startBackgroundDownload(
        video,
        (savedObj) => {
          setDownloadingVideos(prev => prev.filter(id => id !== videoId));
          
          const newDownloadItem = {
            id: videoId,
            videoId,
            title: video.title || savedObj.title || 'فيديو يوتيوب',
            thumbnail: video.thumbnail || video.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            author: video.author || video.authorName || 'قناة يوتيوب',
            lengthSeconds: video.lengthSeconds || 0,
            quality: savedObj.quality || '720p HD',
            url: savedObj.url,
            savedAt: Date.now(),
            ...savedObj,
          };

          // 1. Immediately save to React state and localStorage (permanent across restarts)
          setDownloads(prev => {
            const filtered = prev.filter(v => (v.videoId || v.id) !== videoId);
            const updated = [newDownloadItem, ...filtered];
            safeSetStorage(STORAGE_KEYS.DOWNLOADS, updated);
            return updated;
          });

          // 2. Also persist into IndexedDB
          import('../utils/indexedDB').then(({ saveVideo }) => {
            saveVideo(newDownloadItem).catch(err => console.warn('saveVideo error:', err));
          });

          showToast('تم تنزيل وحفظ الفيديو داخل التطبيق بنجاح! 📥', 'success');
        },
        (errId) => {
          setDownloadingVideos(prev => prev.filter(id => id !== videoId));
          showToast('تعذر تنزيل هذا الفيديو، يرجى تجربة فيديو آخر', 'error');
        }
      );
    });
  }, [downloadingVideos, showToast]);

  const addDownload = useCallback((item) => {
    if (!item || !item.videoId) return;
    const id = item.videoId || item.id;
    setDownloads(prev => {
      const filtered = prev.filter(v => (v.videoId || v.id) !== id);
      const updated = [{ ...item, id, savedAt: Date.now() }, ...filtered];
      safeSetStorage(STORAGE_KEYS.DOWNLOADS, updated);
      return updated;
    });
    import('../utils/indexedDB').then(({ saveVideo }) => {
      saveVideo({ ...item, id }).catch(console.warn);
    });
  }, []);

  const removeDownload = useCallback((videoId) => {
    setDownloads(prev => {
      const filtered = prev.filter(v => (v.videoId || v.id) !== videoId);
      safeSetStorage(STORAGE_KEYS.DOWNLOADS, filtered);
      return filtered;
    });
    import('../utils/indexedDB').then(({ deleteVideo }) => {
      deleteVideo(videoId).catch(console.warn);
    });
    showToast('تمت إزالة الفيديو من التنزيلات المحفوظة', 'info');
  }, [showToast]);

  const clearAllDownloads = useCallback(() => {
    setDownloads([]);
    safeSetStorage(STORAGE_KEYS.DOWNLOADS, []);
    import('../utils/indexedDB').then(({ getVideos, deleteVideo }) => {
      getVideos().then(vids => {
        if (Array.isArray(vids)) {
          vids.forEach(v => deleteVideo(v.id || v.videoId));
        }
      }).catch(console.warn);
    });
    showToast('تم مسح جميع التنزيلات المحفوظة', 'info');
  }, [showToast]);

  const isVideoDownloaded = useCallback((videoId) => {
    if (!videoId) return false;
    return downloads.some(v => (v.videoId || v.id) === videoId);
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
    showToast('تم مسح قائمة المشاهدة لاحقاً بنجاح', 'info');
  }, [showToast]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    safeSetStorage(STORAGE_KEYS.HISTORY, []);
    showToast('تم مسح سجل المشاهدة بنجاح 🗑️', 'info');
  }, [showToast]);

  const setDefaultQuality = useCallback((q) => {
    setDefaultQualityState(q);
    localStorage.setItem('voidtube_default_quality', q);
    showToast(`تم تعيين الجودة الافتراضية إلى ${q}`, 'info');
  }, [showToast]);

  const toggleDataSaver = useCallback(() => {
    setDataSaverState(prev => {
      const next = !prev;
      localStorage.setItem('voidtube_data_saver', String(next));
      showToast(next ? 'تم تفعيل وضع توفير باقة الإنترنت 📶' : 'تم تعطيل وضع توفير باقة الإنترنت', 'info');
      return next;
    });
  }, [showToast]);

  const toggleAutoplayNext = useCallback(() => {
    setAutoplayNextState(prev => {
      const next = !prev;
      localStorage.setItem('voidtube_autoplay_next', String(next));
      showToast(next ? 'تم تفعيل التشغيل التلقائي للتالي ▶️' : 'تم تعطيل التشغيل التلقائي', 'info');
      return next;
    });
  }, [showToast]);

  const clearAppCache = useCallback(() => {
    try {
      sessionStorage.clear();
      showToast('تم تفريغ الذاكرة المؤقتة بنجاح ⚡', 'success');
    } catch(e) {}
  }, [showToast]);

  // Switch Invidious Instance
  const switchInstance = useCallback((url) => {
    api.setCurrentInstance(url);
    setActiveInstance(url);
    showToast('تم تبديل السيرفر بنجاح 🚀', 'success');
  }, [showToast]);

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
        triggerBackgroundDownload,
        downloadingVideos,
        removeDownload,
        clearAllDownloads,
        isVideoDownloaded,
        updateInfo,
        showUpdateModal,
        clearHistory,
        defaultQuality,
        setDefaultQuality,
        dataSaver,
        toggleDataSaver,
        autoplayNext,
        toggleAutoplayNext,
        clearAppCache,
        checkForUpdates,
        appToast,
        setAppToast,
        showToast,
        CURRENT_APP_VERSION,
        miniPlayer,
        showMiniPlayer,
        hideMiniPlayer,
        expandMiniPlayer,
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
