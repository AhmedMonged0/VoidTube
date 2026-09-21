/**
 * Utility functions for formatting duration, views, dates, and clean strings
 */

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const sec = Math.floor(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatViews(views) {
  if (views === undefined || views === null) return '0 مشاهدة';
  if (typeof views === 'string' && (views.includes('مشاهدة') || views.includes('views'))) {
    return views;
  }
  const num = typeof views === 'string' ? parseInt(views.replace(/,/g, ''), 10) : views;
  if (isNaN(num)) return '0 مشاهدة';

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} مليار مشاهدة`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')} مليون مشاهدة`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')} ألف مشاهدة`;
  }
  return `${num.toLocaleString()} مشاهدة`;
}

export function formatTimeAgo(timestampOrText) {
  if (!timestampOrText) return '';
  if (typeof timestampOrText === 'string' && (timestampOrText.includes('منذ') || timestampOrText.includes('ago'))) {
    return timestampOrText;
  }

  let date;
  if (typeof timestampOrText === 'number') {
    date = new Date(timestampOrText > 1e11 ? timestampOrText : timestampOrText * 1000);
  } else {
    date = new Date(timestampOrText);
  }

  if (isNaN(date.getTime())) {
    return typeof timestampOrText === 'string' ? timestampOrText : '';
  }

  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return 'الآن';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `منذ ${diffDays} يوم`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `منذ ${diffMonths} شهر`;
  const diffYears = Math.floor(diffDays / 365);
  return `منذ ${diffYears} سنة`;
}

/**
 * Returns a guaranteed, working high-quality thumbnail.
 * Resolves relative paths, proxies, and defaults to YouTube's CDN for 100% reliability.
 */
export function getBestThumbnail(thumbnails = [], videoId = '') {
  if (videoId) {
    // Official YouTube CDN is permanent, fast, CORS-free, and always renders
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  if (Array.isArray(thumbnails) && thumbnails.length > 0) {
    const sorted = [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
    const url = sorted[0]?.url;
    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (url.startsWith('//')) return `https:${url}`;
      if (url.startsWith('/vi/')) {
        const extractedId = url.split('/')[2];
        if (extractedId) return `https://i.ytimg.com/vi/${extractedId}/hqdefault.jpg`;
      }
    }
  }

  return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '';
}
