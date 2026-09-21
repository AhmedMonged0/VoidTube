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
        // Continue to next instance
        lastError = err;
        console.warn(`[VoidTube] Instance ${base} failed: ${err.message}. Trying next fallback...`);
      }
    }

    throw new Error(lastError ? `All Invidious instances failed: ${lastError.message}` : 'Failed to fetch from any Invidious instance');
  }

  /**
   * Get Trending Videos
   */
  async getTrending(region = 'US') {
    return this.fetchWithFallback('/api/v1/trending', { region });
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
      const res = await fetch(`${url}/api/v1/trending?region=US`, {
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
