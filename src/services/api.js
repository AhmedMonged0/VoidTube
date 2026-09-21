import { INVIDIOUS_INSTANCES, DEFAULT_INSTANCE } from './instances';

// Simple in-memory response cache
const cache = new Map();
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

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
    const queryStr = new URLSearchParams(queryParams).toString();
    const fullEndpoint = queryStr ? `${endpoint}?${queryStr}` : endpoint;
    const cacheKey = fullEndpoint;

    // Check cache
    if (!options.bypassCache && cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return data;
      }
    }

    // Build list of instances to try, starting with currentInstance
    const instancesToTry = [
      this.currentInstance,
      ...INVIDIOUS_INSTANCES.map(i => i.url).filter(u => u !== this.currentInstance)
    ];

    let lastError = null;

    for (const base of instancesToTry) {
      const url = `${base}${fullEndpoint}`;
      try {
        const controller = new AbortController();
        const timeoutMs = options.timeoutMs || 6000;
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
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
   * Get Trending Videos with region support (default: EG for Egypt)
   */
  async getTrending(region = 'EG') {
    return this.fetchWithFallback('/api/v1/trending', { region });
  }

  /**
   * Get Combined Rich Explore Feed (Loads multiple pages for a high volume of videos)
   */
  async getExploreFeed({ region = 'EG', page = 1, category = 'all' } = {}) {
    const regionalQueryMap = {
      EG: 'تريند مصر',
      SA: 'تريند السعودية',
      AR: 'محتوى عربي رائج',
      US: 'trending'
    };

    const query = regionalQueryMap[region] || 'تريند مصر';

    // In page 1, fetch both trending and top search items to maximize video quantity (35+ videos)
    if (page === 1) {
      try {
        const [trendingData, searchData] = await Promise.allSettled([
          this.getTrending(region),
          this.searchVideos(query, 'video', 1)
        ]);

        const trendingList = trendingData.status === 'fulfilled' && Array.isArray(trendingData.value) ? trendingData.value : [];
        const searchList = searchData.status === 'fulfilled' && Array.isArray(searchData.value) ? searchData.value : [];

        // Merge and deduplicate by videoId
        const seen = new Set();
        const combined = [];

        for (const item of [...searchList, ...trendingList]) {
          const id = item.videoId || item.id;
          if (id && !seen.has(id)) {
            seen.add(id);
            combined.push(item);
          }
        }

        if (combined.length > 0) return combined;
      } catch (e) {
        console.warn('[VoidTube] Combined explore failed, falling back to search:', e);
      }
    }

    // Pagination (page >= 2 or fallback)
    return this.searchVideos(query, 'video', page);
  }

  /**
   * Search Videos
   */
  async searchVideos(query, type = 'video', page = 1) {
    if (!query || !query.trim()) return [];
    return this.fetchWithFallback('/api/v1/search', {
      q: query.trim(),
      type,
      page
    });
  }

  /**
   * Get Live Search Suggestions (Autocomplete)
   */
  async getSuggestions(query) {
    if (!query || !query.trim()) return [];
    const cleanQuery = query.trim();

    // 1. Try Invidious API suggestions endpoint
    try {
      const data = await this.fetchWithFallback('/api/v1/search/suggestions', { q: cleanQuery }, { timeoutMs: 3000 });
      if (data && Array.isArray(data.suggestions)) {
        return data.suggestions;
      }
    } catch (e) {
      console.warn('[VoidTube] Invidious suggestions failed, trying fallback:', e);
    }

    // 2. Direct fallback to YouTube Suggest endpoint
    try {
      const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(cleanQuery)}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[1])) {
          return data[1];
        }
      }
    } catch (err) {
      console.warn('[VoidTube] YouTube fallback suggestions failed:', err);
    }

    return [];
  }

  /**
   * Get Single Video Details (Includes formatStreams, description, recommendedVideos)
   */
  async getVideoDetails(videoId) {
    if (!videoId) throw new Error('Video ID is required');
    return this.fetchWithFallback(`/api/v1/videos/${videoId}`);
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
