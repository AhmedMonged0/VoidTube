import { INVIDIOUS_INSTANCES, DEFAULT_INSTANCE } from './instances';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

// Simple in-memory response cache
const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

// Rolling session seen IDs tracker (Anti-Repetition system)
const SEEN_VIDEOS_SESSION_KEY = 'voidtube_seen_videos_v1';
function getSeenVideoIds() {
  try {
    const raw = sessionStorage.getItem(SEEN_VIDEOS_SESSION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function addSeenVideoIds(newIds) {
  try {
    const existing = getSeenVideoIds();
    const combined = Array.from(new Set([...existing, ...newIds])).slice(-150);
    sessionStorage.setItem(SEEN_VIDEOS_SESSION_KEY, JSON.stringify(combined));
  } catch {}
}

let sessionSeedOffset = Math.floor(Math.random() * 50);

export const REGIONAL_TOPIC_POOLS = {
  EG: [
    // 1. Hot Trending & Viral
    { query: 'تريند مصر اليوم رائج', sort: 'relevance' },
    { query: 'فيديوهات جديدة رائج مصر', sort: 'upload_date' },
    { query: 'لقاءات المشاهير وبرامج توك شو', sort: 'view_count' },
    // 2. Top-tier Egyptian Podcasts & Real Stories
    { query: 'بودكاست مصري جديد حوارات', sort: 'relevance' },
    { query: 'بودكاست إبراهيم فايق الجديد حوار', sort: 'relevance' },
    { query: 'فنجان بودكاست إذاعة ثمانية', sort: 'relevance' },
    { query: 'حكايات وقصص واقعية وتاريخية', sort: 'view_count' },
    // 3. Street Life, Vlogs & Exploration
    { query: 'فلوجات شوارع مصر وجولات', sort: 'relevance' },
    { query: 'جو حطاب جولات واستكشاف وسفر', sort: 'relevance' },
    { query: 'أكل شوارع وتجارب مطاعم مصرية', sort: 'relevance' },
    { query: 'تحدي 24 ساعة فلوج مصر', sort: 'relevance' },
    { query: 'أماكن سرية وغريبة في مصر جولات', sort: 'relevance' },
    // 4. Knowledge, Science & Deep Dives
    { query: 'الدحيح حلقات جديدة علوم ومعرفة', sort: 'relevance' },
    { query: 'وثائقيات تاريخية وعلمية شيقة بالعربي', sort: 'relevance' },
    { query: 'حقائق ومعلومات مذهلة حول العالم', sort: 'view_count' },
    { query: 'قصص نجاح شركات واقتصاد عالمي', sort: 'relevance' },
    // 5. Comedy & Egyptian Entertainment
    { query: 'كوميديا مصرية مواقف واسكتشات جديدة', sort: 'relevance' },
    { query: 'اسكتشات مضحكة جديدة مصر', sort: 'upload_date' },
    { query: 'مقالب وتحديات مسلية مضحكة', sort: 'relevance' },
    { query: 'ستاند اب كوميدي مصري مضحك', sort: 'relevance' },
    // 6. Food, Gourmet & Fast Cooking
    { query: 'اكلات مصرية طبخ سهلة وسريعة', sort: 'relevance' },
    { query: 'وصفات شيف سريعة نادية السيد', sort: 'relevance' },
    { query: 'حلويات شرقية ووصفات بيت سهلة', sort: 'relevance' },
    // 7. Football & Sports Highlights
    { query: 'ملخص اهداف مباريات اليوم الدوري', sort: 'upload_date' },
    { query: 'أهداف الأهلي والزمالك ملخصات', sort: 'relevance' },
    { query: 'تحليل كروي ممتع وأهداف عالمية', sort: 'relevance' },
    { query: 'مهارات ولقطات كرة قدم أسطورية', sort: 'view_count' },
    // 8. Cinema, Series & Movie Recaps
    { query: 'ملخصات افلام ومسلسلات سينما جديدة', sort: 'relevance' },
    { query: 'مراجعة فيلم جديد سينمائي بدون حرق', sort: 'relevance' },
    { query: 'أقوى أفلام سينمائية ملخص أكشن', sort: 'view_count' },
    // 9. Tech & Gaming
    { query: 'مراجعات هواتف ذكية وتكنولوجيا جديدة', sort: 'upload_date' },
    { query: 'جيمنج عربي مضحك وتحديات', sort: 'relevance' },
    { query: 'العاب رعب ومغامرات تختيم', sort: 'relevance' }
  ],
  SA: [
    { query: 'تريند السعودية اليوم رائج', sort: 'relevance' },
    { query: 'بودكاست فنجان ثمانية جديد حوار', sort: 'relevance' },
    { query: 'فلوجات الرياض وجدة ومغامرات', sort: 'relevance' },
    { query: 'دوري روشن السعودي ملخص واهداف', sort: 'upload_date' },
    { query: 'تحديات سيارات وسفر ومقالب', sort: 'relevance' },
    { query: 'تقنية وهواتف ذكية مراجعة جديدة', sort: 'upload_date' },
    { query: 'يوميات وتحديات سعودية مسلية', sort: 'relevance' },
    { query: 'وثائقيات سعودية وعربية تاريخية', sort: 'view_count' }
  ],
  AR: [
    { query: 'فيديوهات عربية رائجة اليوم تريند', sort: 'relevance' },
    { query: 'وثائقيات شيقة بالعربي تاريخية', sort: 'relevance' },
    { query: 'فلوجات سفر حول العالم بالعربي', sort: 'relevance' },
    { query: 'بودكاست عربي ملهم تجارب حقيقية', sort: 'relevance' },
    { query: 'تحديات ومقالب عربية ترفيهية', sort: 'relevance' },
    { query: 'اكتشافات وحقائق علمية مذهلة', sort: 'view_count' },
    { query: 'ملخص مباريات عالمية اليوم أهداف', sort: 'upload_date' }
  ],
  US: [
    { query: 'trending videos today', sort: 'relevance' },
    { query: 'interesting documentary stories', sort: 'relevance' },
    { query: 'viral entertainment highlights', sort: 'relevance' },
    { query: 'tech reviews latest innovations', sort: 'upload_date' },
    { query: 'popular podcasts and comedy sketches', sort: 'view_count' }
  ]
};

class InvidiousApiService {
  constructor() {
    const saved = localStorage.getItem('voidtube_preferred_instance');
    this.currentInstance = saved || DEFAULT_INSTANCE;
    this.listeners = new Set();
  }

  getCurrentInstance() {
    return this.currentInstance;
  }

  setCurrentInstance(url) {
    this.currentInstance = url;
    localStorage.setItem('voidtube_preferred_instance', url);
    this.notifyListeners();
  }

  onInstanceChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    for (const cb of this.listeners) {
      try {
        cb(this.currentInstance);
      } catch (err) {
        console.error('Instance change listener error:', err);
      }
    }
  }

  /**
   * Resilient fetcher: tries current instance, falls back through pool if error occurs
   */
  async fetchWithFallback(endpoint, queryParams = {}, options = {}) {
    // Always include hl=ar and region=EG by default for authentic Arabic content
    const mergedParams = {
      hl: 'ar',
      ...queryParams
    };

    const queryStr = new URLSearchParams(mergedParams).toString();
    const fullEndpoint = queryStr ? `${endpoint}?${queryStr}` : endpoint;
    const cacheKey = fullEndpoint;

    // Check cache
    if (!options.bypassCache && cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return data;
      }
    }

    // Build list of instances to try
    const instancesToTry = [
      this.currentInstance,
      ...INVIDIOUS_INSTANCES.map(i => i.url).filter(u => u !== this.currentInstance)
    ];

    let lastError = null;

    for (const base of instancesToTry) {
      const url = `${base}${fullEndpoint}`;
      try {
        const controller = new AbortController();
        const timeoutMs = options.timeoutMs || 3500;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'ar,ar-EG;q=0.9,en;q=0.8',
          },
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} from ${base}`);
        }

        const data = await res.json();

        // If we succeeded on a fallback instance, update current instance
        if (base !== this.currentInstance) {
          console.info(`[VoidTube] Switched to working instance: ${base}`);
          this.setCurrentInstance(base);
        }

        // Cache the successful response
        cache.set(cacheKey, { data, timestamp: Date.now() });
        return data;
      } catch (err) {
        lastError = err;
        console.warn(`[VoidTube] Instance ${base} failed: ${err.message}. Trying next fallback...`);
      }
    }

    throw new Error(lastError ? `All Invidious instances failed: ${lastError.message}` : 'Failed to fetch from any Invidious instance');
  }

  /**
   * Get Trending Videos with region support
   */
  async getTrending(region = 'EG') {
    return this.fetchWithFallback('/api/v1/trending', { region, hl: 'ar' }, { timeoutMs: 3500 });
  }

  /**
   * Dynamic, Rotating Feed Generator with Anti-Repetition Intelligence
   */
  async getExploreFeed({ region = 'EG', page = 1, forceRefresh = false } = {}) {
    const pool = REGIONAL_TOPIC_POOLS[region] || REGIONAL_TOPIC_POOLS.EG;
    const poolLen = pool.length;

    // Advance session offset on refresh or initial load to ensure totally new topics each time
    if (forceRefresh) {
      sessionSeedOffset = (sessionSeedOffset + 7 + Math.floor(Math.random() * 5)) % poolLen;
    }

    // Step by 5 across the topic pool so each request draws from completely different genres
    const step = 5;
    const baseIndex = (sessionSeedOffset + (page - 1) * 3) % poolLen;

    const selectedTopics = [
      pool[baseIndex],
      pool[(baseIndex + step) % poolLen],
      pool[(baseIndex + step * 2) % poolLen],
      pool[(baseIndex + step * 3) % poolLen],
    ];

    try {
      const fetchPage = Math.floor((page - 1) / 2) + 1;
      const fetchPromises = selectedTopics.map(t => 
        this.searchVideos(t.query, 'video', fetchPage, {
          sortBy: t.sort,
          region,
          bypassCache: forceRefresh
        })
      );

      // On page 1, also attempt to mix in authentic live trending videos
      if (page === 1) {
        fetchPromises.push(this.getTrending(region).catch(() => []));
      }

      const results = await Promise.allSettled(fetchPromises);

      const lists = results
        .filter(r => r.status === 'fulfilled' && Array.isArray(r.value))
        .map(r => r.value);

      const combined = [];
      const seen = new Set();
      const maxLen = Math.max(...lists.map(l => l.length), 0);

      // Interleave topics smoothly for a natural, rich YouTube-like stream
      for (let i = 0; i < maxLen; i++) {
        for (const list of lists) {
          if (list[i]) {
            const id = list[i].videoId || list[i].id;
            if (id && !seen.has(id)) {
              seen.add(id);
              combined.push(list[i]);
            }
          }
        }
      }

      // Anti-Repetition Filter: prioritize videos the user hasn't seen yet in this session
      const sessionSeenSet = new Set(getSeenVideoIds());
      const freshVideos = [];
      const previouslySeenVideos = [];

      for (const item of combined) {
        const id = item.videoId || item.id;
        if (sessionSeenSet.has(id)) {
          previouslySeenVideos.push(item);
        } else {
          freshVideos.push(item);
        }
      }

      // Unseen fresh videos take front priority!
      const ordered = [...freshVideos, ...previouslySeenVideos];

      // Record shown video IDs into session storage
      const newlyShownIds = ordered.slice(0, 24).map(v => v.videoId || v.id).filter(Boolean);
      addSeenVideoIds(newlyShownIds);

      if (ordered.length > 0) return ordered;
    } catch (err) {
      console.warn('[VoidTube] Dynamic feed error, fallback to broad search:', err);
    }

    // Default fallback
    return this.searchVideos(region === 'EG' ? 'تريند مصر اليوم' : 'trending', 'video', page, { bypassCache: forceRefresh });
  }

  /**
   * Search Videos with sorting, date, and region options
   */
  async searchVideos(query, type = 'video', page = 1, options = {}) {
    if (!query || !query.trim()) return [];
    const params = {
      q: query.trim(),
      type,
      page,
      hl: 'ar',
      region: options.region || 'EG'
    };
    if (options.sortBy) params.sort_by = options.sortBy;
    if (options.date) params.date = options.date;
    return this.fetchWithFallback('/api/v1/search', params, options);
  }

  /**
   * Get Live Search Suggestions (Autocomplete)
   * Highly resilient multi-tier engine:
   * 1. Native CapacitorHttp on Android/iOS (0 CORS, direct Google query, ~40ms)
   * 2. Direct Invidious instance suggestion API (CORS: *)
   * 3. YouTube JSONP for standard desktop web browsers
   * 4. DuckDuckGo / Piped fallback
   */
  async getSuggestions(query) {
    if (!query || !query.trim()) return [];
    const cleanQuery = query.trim();

    // In-memory cache check
    if (!this._suggestionCache) this._suggestionCache = new Map();
    if (this._suggestionCache.has(cleanQuery)) {
      return this._suggestionCache.get(cleanQuery);
    }

    // Tier 1: Native Android / iOS via CapacitorHttp (Bypasses all CORS and WebView limitations)
    if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
      try {
        const response = await CapacitorHttp.get({
          url: `https://suggestqueries.google.com/complete/search?client=firefox&hl=ar&gl=eg&q=${encodeURIComponent(cleanQuery)}`,
          connectTimeout: 2500,
          readTimeout: 2500
        });

        if (response && response.data) {
          let parsed = response.data;
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch {}
          }
          if (Array.isArray(parsed) && Array.isArray(parsed[1]) && parsed[1].length > 0) {
            const list = parsed[1].filter(item => typeof item === 'string' && item.trim().length > 0);
            if (list.length > 0) {
              if (this._suggestionCache.size > 200) this._suggestionCache.clear();
              this._suggestionCache.set(cleanQuery, list);
              return list;
            }
          }
        }
      } catch (e) {
        console.warn('[VoidTube] CapacitorHttp suggestions failed, falling back:', e);
      }
    }

    // Tier 2: Invidious Instance Suggestions (CORS: * supported on f5.si and cluster nodes)
    try {
      const data = await this.fetchWithFallback('/api/v1/search/suggestions', { q: cleanQuery, hl: 'ar' }, { timeoutMs: 1800, bypassCache: true });
      if (data && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        if (this._suggestionCache.size > 200) this._suggestionCache.clear();
        this._suggestionCache.set(cleanQuery, data.suggestions);
        return data.suggestions;
      }
    } catch (e) {
      console.warn('[VoidTube] Invidious suggestions fallback error:', e);
    }

    // Tier 3: YouTube JSONP for standard Web Browsers (0 CORS in desktop browser)
    try {
      const jsonpList = await new Promise((resolve) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
          return resolve(null);
        }
        const cbName = 'voidtube_sug_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
        const script = document.createElement('script');
        let timer = setTimeout(() => {
          cleanup();
          resolve(null);
        }, 900);

        function cleanup() {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          try {
            delete window[cbName];
          } catch {}
          if (script && script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }

        window[cbName] = (data) => {
          cleanup();
          try {
            if (Array.isArray(data) && Array.isArray(data[1])) {
              const list = data[1]
                .map(item => (Array.isArray(item) ? item[0] : item))
                .filter(item => typeof item === 'string' && item.trim().length > 0);
              resolve(list);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };

        script.onerror = () => {
          cleanup();
          resolve(null);
        };

        script.src = `https://suggestqueries.google.com/complete/search?client=youtube&hl=ar&gl=eg&q=${encodeURIComponent(cleanQuery)}&jsonp=${cbName}`;
        document.head.appendChild(script);
      });

      if (Array.isArray(jsonpList) && jsonpList.length > 0) {
        if (this._suggestionCache.size > 200) this._suggestionCache.clear();
        this._suggestionCache.set(cleanQuery, jsonpList);
        return jsonpList;
      }
    } catch (e) {
      console.warn('[VoidTube] JSONP suggestions failed:', e);
    }

    // Tier 4: DuckDuckGo Fallback
    try {
      const ddgUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(cleanQuery)}&type=list`;
      let ddgData = null;
      if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
        const ddgRes = await CapacitorHttp.get({ url: ddgUrl });
        ddgData = ddgRes.data;
        if (typeof ddgData === 'string') {
          try { ddgData = JSON.parse(ddgData); } catch {}
        }
      } else {
        const res = await fetch(ddgUrl, { signal: AbortSignal.timeout(1200) });
        if (res.ok) ddgData = await res.json();
      }

      if (Array.isArray(ddgData) && Array.isArray(ddgData[1]) && ddgData[1].length > 0) {
        const list = ddgData[1];
        this._suggestionCache.set(cleanQuery, list);
        return list;
      }
    } catch (err) {
      console.warn('[VoidTube] DDG fallback suggestions failed:', err);
    }

    return [];
  }

  /**
   * Get Single Video Details
   */
  async getVideoDetails(videoId) {
    if (!videoId) throw new Error('Video ID is required');
    try {
      return await this.fetchWithFallback(`/api/v1/videos/${videoId}`, { hl: 'ar', region: 'EG' }, { timeoutMs: 3000 });
    } catch (err) {
      console.warn('[VoidTube] Invidious getVideoDetails failed, using NoEmbed fallback:', err);
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`, {
          signal: AbortSignal.timeout(2000)
        });
        if (res.ok) {
          const info = await res.json();
          return {
            videoId,
            title: info.title || 'فيديو يوتيوب',
            author: info.author_name || 'قناة يوتيوب',
            authorUrl: info.author_url || '',
            lengthSeconds: 0,
            viewCount: 0,
            publishedText: 'متاح الآن',
            videoThumbnails: [
              { url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`, quality: 'maxres' },
              { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, quality: 'high' }
            ],
            recommendedVideos: []
          };
        }
      } catch (e2) {
        console.warn('[VoidTube] NoEmbed fallback failed:', e2);
      }
      return {
        videoId,
        title: 'فيديو يوتيوب',
        author: 'قناة يوتيوب',
        videoThumbnails: [
          { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, quality: 'high' }
        ],
        recommendedVideos: []
      };
    }
  }

  /**
   * Get Channel Details (with resilient search fallback)
   */
  async getChannelDetails(channelId, channelName = '') {
    const isChannelId = channelId && (channelId.startsWith('UC') || channelId.length >= 20);
    if (isChannelId) {
      try {
        const details = await this.fetchWithFallback(`/api/v1/channels/${channelId}`, { hl: 'ar' }, { timeoutMs: 3000 });
        if (details && (details.author || details.title)) {
          return details;
        }
      } catch (err) {
        console.warn('[VoidTube] Channel API fetch failed, trying search fallback:', err);
      }
    }

    // Fallback: search by author/channel name
    const query = channelName || channelId || 'YouTube Channel';
    try {
      const searchRes = await this.searchVideos(query, 'channel', 1);
      if (Array.isArray(searchRes) && searchRes.length > 0) {
        const match = searchRes[0];
        return {
          author: match.author || match.title || query,
          authorId: match.authorId || channelId,
          authorThumbnails: match.authorThumbnails || [{ url: match.thumbnail || `https://i.ytimg.com/i/${channelId}/1.jpg` }],
          authorBanners: match.authorBanners || [],
          subCount: match.subCount || null,
          subCountText: match.subCountText || 'مشترك',
          description: match.description || 'قناة يوتيوب على شبكة VoidTube',
          authorVerified: match.authorVerified || false
        };
      }
    } catch (e2) {
      console.warn('[VoidTube] Channel search fallback failed:', e2);
    }

    return {
      author: channelName || 'القناة',
      authorId: channelId,
      authorThumbnails: [{ url: `https://i.ytimg.com/i/${channelId}/1.jpg` }],
      authorBanners: [],
      subCountText: '',
      description: '',
      authorVerified: false
    };
  }

  /**
   * Get Channel Videos with sorting options (latest, popular, oldest)
   */
  async getChannelVideos(channelId, channelName = '', sortBy = 'latest') {
    const isChannelId = channelId && (channelId.startsWith('UC') || channelId.length >= 20);
    
    // Convert sortBy to Invidious / search sort param
    let invidiousSort = 'newest';
    let searchSort = 'upload_date';
    if (sortBy === 'popular' || sortBy === 'most_viewed') {
      invidiousSort = 'popular';
      searchSort = 'view_count';
    } else if (sortBy === 'oldest') {
      invidiousSort = 'oldest';
      searchSort = 'upload_date';
    }

    if (isChannelId) {
      try {
        const res = await this.fetchWithFallback(`/api/v1/channels/${channelId}/videos`, {
          sort_by: invidiousSort,
          hl: 'ar'
        }, { timeoutMs: 3500 });
        if (Array.isArray(res) && res.length > 0) return res;
        if (res && Array.isArray(res.videos) && res.videos.length > 0) return res.videos;
      } catch (err) {
        console.warn('[VoidTube] Channel videos endpoint failed, trying search fallback:', err);
      }
    }

    // Fallback: search videos by channel name
    const query = channelName || channelId || '';
    if (!query) return [];
    try {
      const results = await this.searchVideos(query, 'video', 1, { sortBy: searchSort });
      return Array.isArray(results) ? results : [];
    } catch (err) {
      console.warn('[VoidTube] Fallback channel search failed:', err);
      return [];
    }
  }

  /**
   * Get Spotlight Videos for Hero carousel
   */
  async getSpotlightVideos(region = 'EG') {
    try {
      const trending = await this.getTrending(region);
      if (Array.isArray(trending) && trending.length >= 3) {
        return trending.slice(0, 5);
      }
    } catch (e) {
      console.warn('[VoidTube] Spotlight trending failed, using explore feed fallback:', e);
    }
    const feed = await this.getExploreFeed({ region, page: 1 });
    return (feed || []).slice(0, 5);
  }

  /**
   * Ping/test health of an instance
   */
  async pingInstance(url) {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${url}/api/v1/trending?region=EG`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);
      const elapsed = Math.round(performance.now() - start);
      return { ok: res.ok, status: res.status, latency: elapsed };
    } catch (e) {
      return { ok: false, error: e.message, latency: null };
    }
  }
}

export const api = new InvidiousApiService();
export default api;
