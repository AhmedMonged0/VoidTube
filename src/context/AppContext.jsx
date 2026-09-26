import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
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
  // Navigation state: { page: 'home' | 'watch' | 'search' | 'bookmarks' | 'channel' | 'audio' | 'library' | 'explore', videoId, query, channelId, channelData, audioTrack }
  const [nav, setNav] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('v');
    const query = params.get('q');
    const page = params.get('page');
    const channelId = params.get('c');

    if (videoId) return { page: 'watch', videoId, query: '' };
    if (channelId) return { page: 'channel', channelId, query: '', videoId: '' };
    if (query) return { page: 'search', query, videoId: '' };
    if (page === 'bookmarks' || page === 'library') return { page: 'library', query: '', videoId: '' };
    if (page === 'audio' || page === 'focus') return { page: 'audio', query: '', videoId: '' };
    if (page === 'explore') return { page: 'explore', query: '', videoId: '' };
    if (page === 'settings') return { page: 'settings', query: '', videoId: '' };
    return { page: 'home', query: '', videoId: '' };
  });

  // Global Player & Audio Preferences
  const [playbackSpeed, setPlaybackSpeedState] = useState(() => {
    return parseFloat(localStorage.getItem('voidtube_playback_speed') || '1');
  });
  const setPlaybackSpeed = useCallback((speed) => {
    setPlaybackSpeedState(speed);
    localStorage.setItem('voidtube_playback_speed', speed.toString());
  }, []);

  const [isLoop, setIsLoop] = useState(false);
  const toggleLoop = useCallback(() => setIsLoop(prev => !prev), []);

  // Sleep Timer System
  const [sleepTimer, setSleepTimer] = useState({ active: false, minutes: 0, endTime: null, label: '' });
  const sleepTimerTimeoutRef = useRef(null);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
      sleepTimerTimeoutRef.current = null;
    }
    setSleepTimer({ active: false, minutes: 0, endTime: null, label: '' });
  }, []);

  // Active Audio Focus Track State
  const [currentAudioTrack, setCurrentAudioTrack] = useState({
    title: 'Focusing Deep, | Coding Void',
    subtitle: 'Focusing Deep, Vol. 4 | Coding Void',
    duration: 265, // 04:25
    artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    chapters: [
      { title: 'Intro', time: 0 },
      { title: 'Setup', time: 760 },
      { title: 'Core Implementation', time: 1452 },
      { title: 'Q&A', time: 2710 }
    ]
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

  // Visual Accent Theme
  const [accentTheme, setAccentThemeState] = useState(() => {
    return localStorage.getItem('voidtube_accent_theme_v1') || 'purple';
  });

  const setAccentTheme = useCallback((theme) => {
    setAccentThemeState(theme);
    try {
      localStorage.setItem('voidtube_accent_theme_v1', theme);
      document.documentElement.dataset.accent = theme;
    } catch(e) {}
  }, []);

  useEffect(() => {
    try {
      document.documentElement.dataset.accent = accentTheme;
    } catch(e) {}
  }, [accentTheme]);

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

  // Mobile Fullscreen Search Overlay state
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

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
  const CURRENT_APP_VERSION = '1.0.10';
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
      const channelId = params.get('c');
      const query = params.get('q');
      const page = params.get('page');

      if (videoId) {
        setNav({ page: 'watch', videoId, query: '' });
      } else if (channelId) {
        setNav({ page: 'channel', channelId, query: '', videoId: '' });
      } else if (query) {
        setNav({ page: 'search', query, videoId: '' });
      } else if (page === 'bookmarks' || page === 'library') {
        setNav({ page: 'library', query: '', videoId: '' });
      } else if (page === 'audio' || page === 'focus') {
        setNav({ page: 'audio', query: '', videoId: '' });
      } else if (page === 'explore') {
        setNav({ page: 'explore', query: '', videoId: '' });
      } else if (page === 'settings') {
        setNav({ page: 'settings', query: '', videoId: '', channelId: '' });
      } else {
        setNav({ page: 'home', query: '', videoId: '' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sleep Timer Controller
  const startSleepTimer = useCallback((minutes, label = '') => {
    if (sleepTimerTimeoutRef.current) {
      clearTimeout(sleepTimerTimeoutRef.current);
    }
    const ms = minutes * 60 * 1000;
    const endTime = Date.now() + ms;
    const displayLabel = label || `${minutes} دقيقة`;
    setSleepTimer({ active: true, minutes, endTime, label: displayLabel });
    showToast(`⏰ تم تفعيل مؤقت النوم: ${displayLabel}`, 'info');

    sleepTimerTimeoutRef.current = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('voidtube-sleep-timer-trigger'));
      setSleepTimer({ active: false, minutes: 0, endTime: null, label: '' });
      showToast('💤 انتهى وقت مؤقت النوم وتم إيقاف التشغيل للمحافظة على هدوئك', 'info');
    }, ms);
  }, [showToast]);

  // Navigation helpers
  const navigateToHome = useCallback(() => {
    window.history.pushState({}, '', window.location.pathname);
    setNav({ page: 'home', query: '', videoId: '', channelId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToWatch = useCallback((videoId, videoData = null) => {
    if (!videoId) return;
    window.history.pushState({}, '', `?v=${videoId}`);
    setNav({ page: 'watch', videoId, query: '', videoData, channelId: '' });
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
    setNav({ page: 'search', query: cleanQuery, videoId: '', channelId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [addRecentSearch]);

  const navigateToChannel = useCallback((channelId, channelData = null) => {
    if (!channelId) return;
    window.history.pushState({}, '', `?c=${encodeURIComponent(channelId)}`);
    setNav({ page: 'channel', channelId, channelData, query: '', videoId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToAudio = useCallback((trackData = null) => {
    window.history.pushState({}, '', `?page=audio`);
    if (trackData) setCurrentAudioTrack(trackData);
    setNav({ page: 'audio', query: '', videoId: '', channelId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToLibrary = useCallback(() => {
    window.history.pushState({}, '', `?page=library`);
    setNav({ page: 'library', query: '', videoId: '', channelId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToExplore = useCallback(() => {
    window.history.pushState({}, '', `?page=explore`);
    setNav({ page: 'explore', query: '', videoId: '', channelId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToSettings = useCallback(() => {
    window.history.pushState({}, '', `?page=settings`);
    setNav({ page: 'settings', query: '', videoId: '', channelId: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToBookmarks = useCallback(() => {
    navigateToLibrary();
  }, [navigateToLibrary]);

  // Export / Import Backup JSON
  const exportBackupData = useCallback(() => {
    try {
      const backup = {
        app: 'VoidTube',
        version: CURRENT_APP_VERSION,
        exportedAt: new Date().toISOString(),
        watchLater,
        history,
        recentSearches,
        settings: {
          region,
          defaultQuality,
          dataSaver,
          autoplayNext
        }
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `voidtube-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('تم تصدير النسخة الاحتياطية بنجاح 💾', 'success');
    } catch (e) {
      showToast('تعذر تصدير النسخة الاحتياطية', 'error');
    }
  }, [watchLater, history, recentSearches, region, defaultQuality, dataSaver, autoplayNext, showToast]);

  const importBackupData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.watchLater && Array.isArray(data.watchLater)) {
          setWatchLater(data.watchLater);
          safeSetStorage(STORAGE_KEYS.WATCH_LATER, data.watchLater);
        }
        if (data.history && Array.isArray(data.history)) {
          setHistory(data.history);
          safeSetStorage(STORAGE_KEYS.HISTORY, data.history);
        }
        showToast('تمت استعادة النسخة الاحتياطية بنجاح! ✨', 'success');
      } catch (err) {
        showToast('الملف غير صالح أو تالف', 'error');
      }
    };
    reader.readAsText(file);
  }, [showToast]);

  // Keep live references for Android hardware back button handler
  const navRef = useRef(nav);
  const isMobileSearchOpenRef = useRef(isMobileSearchOpen);
  const showUpdateModalRef = useRef(showUpdateModal);
  const isSidebarOpenRef = useRef(isSidebarOpen);
  const isDownloadsOpenRef = useRef(isDownloadsOpen);
  const isWatchLaterOpenRef = useRef(isWatchLaterOpen);
  const isInstanceModalOpenRef = useRef(isInstanceModalOpen);

  useEffect(() => { navRef.current = nav; }, [nav]);
  useEffect(() => { isMobileSearchOpenRef.current = isMobileSearchOpen; }, [isMobileSearchOpen]);
  useEffect(() => { showUpdateModalRef.current = showUpdateModal; }, [showUpdateModal]);
  useEffect(() => { isSidebarOpenRef.current = isSidebarOpen; }, [isSidebarOpen]);
  useEffect(() => { isDownloadsOpenRef.current = isDownloadsOpen; }, [isDownloadsOpen]);
  useEffect(() => { isWatchLaterOpenRef.current = isWatchLaterOpen; }, [isWatchLaterOpen]);
  useEffect(() => { isInstanceModalOpenRef.current = isInstanceModalOpen; }, [isInstanceModalOpen]);

  // Intercept Android Native Hardware Back Button
  useEffect(() => {
    let listenerHandle = null;

    const setupBackButton = async () => {
      try {
        listenerHandle = await CapApp.addListener('backButton', () => {
          // 1. Close mobile search overlay if open
          if (isMobileSearchOpenRef.current) {
            setIsMobileSearchOpen(false);
            return;
          }

          // 2. Close update modal if open
          if (showUpdateModalRef.current) {
            setShowUpdateModal(false);
            return;
          }

          // 3. Close instance modal if open
          if (isInstanceModalOpenRef.current) {
            setIsInstanceModalOpen(false);
            return;
          }

          // 4. Close settings/sidebar if open
          if (isSidebarOpenRef.current) {
            setIsSidebarOpen(false);
            return;
          }

          // 5. Close downloads drawer if open
          if (isDownloadsOpenRef.current) {
            setIsDownloadsOpen(false);
            return;
          }

          // 6. Close watch later drawer if open
          if (isWatchLaterOpenRef.current) {
            setIsWatchLaterOpen(false);
            return;
          }

          // 7. If currently on watch page: minimize to floating miniplayer and return to home
          if (navRef.current.page === 'watch') {
            if (navRef.current.videoId) {
              showMiniPlayer(navRef.current.videoId, navRef.current.videoData);
            }
            navigateToHome();
            return;
          }

          // 8. If on search or bookmarks, return to home
          if (navRef.current.page !== 'home') {
            navigateToHome();
            return;
          }

          // 9. When on the Home Screen with no overlays open -> EXIT APP!
          CapApp.exitApp();
        });
      } catch (err) {
        console.warn('Capacitor backButton setup failed:', err);
      }
    };

    setupBackButton();

    return () => {
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        listenerHandle.remove();
      }
    };
  }, [navigateToHome, showMiniPlayer]);

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
        navigateToChannel,
        navigateToAudio,
        navigateToLibrary,
        navigateToExplore,
        navigateToSettings,
        accentTheme,
        setAccentTheme,
        playbackSpeed,
        setPlaybackSpeed,
        isLoop,
        toggleLoop,
        sleepTimer,
        startSleepTimer,
        cancelSleepTimer,
        currentAudioTrack,
        setCurrentAudioTrack,
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
        isMobileSearchOpen,
        setIsMobileSearchOpen,
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
        exportBackupData,
        importBackupData,
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
