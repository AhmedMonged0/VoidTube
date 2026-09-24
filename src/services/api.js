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
    return this.fetchWithFallback('/api/v1/trending', { region, hl: 'ar' });
  }

  /**
   * Get Rich, Diverse Egyptian Everyday Feed (Cooking, Vlogs, Podcasts, Culture, Comedy)
   */
  async getExploreFeed({ region = 'EG', page = 1 } = {}) {
    if (region === 'EG') {
      // Curated diverse Egyptian topics for everyday viewing
      const egyptianTopics = [
        'اكلات مصرية طبخ سهلة',
        'فلوجات مصر جولات',
        'بودكاست مصري حوار',
        'الدحيح معرفة',
        'كوميديا مصرية مواقف',
        'ملخص اهداف الدوري المصري'
      ];

      try {
        // Fetch topics in parallel with pagination support
        const topicIndex = (page - 1) % egyptianTopics.length;
        const selectedTopics = [
          egyptianTopics[topicIndex],
          egyptianTopics[(topicIndex + 1) % egyptianTopics.length],
          egyptianTopics[(topicIndex + 2) % egyptianTopics.length]
        ];

        const fetchPage = Math.floor((page - 1) / egyptianTopics.length) + 1;

        const results = await Promise.allSettled(
          selectedTopics.map(q => this.searchVideos(q, 'video', fetchPage))
        );

        const combined = [];
        const seen = new Set();

        const lists = results
          .filter(r => r.status === 'fulfilled' && Array.isArray(r.value))
          .map(r => r.value);

        const maxLen = Math.max(...lists.map(l => l.length), 0);

        // Interleave topics for a balanced, vibrant feed
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

        if (combined.length > 0) return combined;
      } catch (err) {
        console.warn('[VoidTube] Interleaved Egyptian feed error, fallback to search:', err);
      }
    }

    // Default fallback
    return this.searchVideos(region === 'EG' ? 'محتوى مصري' : 'trending', 'video', page);
  }

  /**
   * Search Videos
   */
  async searchVideos(query, type = 'video', page = 1) {
    if (!query || !query.trim()) return [];
    return this.fetchWithFallback('/api/v1/search', {
      q: query.trim(),
      type,
      page,
      hl: 'ar',
      region: 'EG'
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
      const data = await this.fetchWithFallback('/api/v1/search/suggestions', { q: cleanQuery, hl: 'ar' }, { timeoutMs: 2500 });
      if (data && Array.isArray(data.suggestions)) {
        return data.suggestions;
      }
    } catch (e) {
      console.warn('[VoidTube] Invidious suggestions fallback:', e);
    }

    // 2. Direct fallback to YouTube Suggest endpoint
    try {
      const res = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&hl=ar&gl=eg&q=${encodeURIComponent(cleanQuery)}`, {
        signal: AbortSignal.timeout(2500)
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
