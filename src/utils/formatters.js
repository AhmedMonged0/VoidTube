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
  if (views === undefined || views === null) return '0 views';
  const num = typeof views === 'string' ? parseInt(views.replace(/,/g, ''), 10) : views;
  if (isNaN(num)) return '0 views';

  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B views`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  return `${num.toLocaleString()} views`;
}

export function formatTimeAgo(timestampOrText) {
  if (!timestampOrText) return '';
  // If it's already a relative string like "3 days ago" or "5 hours ago"
  if (typeof timestampOrText === 'string' && timestampOrText.includes('ago')) {
    return timestampOrText;
  }

  let date;
  if (typeof timestampOrText === 'number') {
    // Check if timestamp in seconds or ms
    date = new Date(timestampOrText > 1e11 ? timestampOrText : timestampOrText * 1000);
  } else {
    date = new Date(timestampOrText);
  }

  if (isNaN(date.getTime())) {
    return typeof timestampOrText === 'string' ? timestampOrText : '';
  }

  const now = new Date();
  const diffSeconds = Math.floor((now - date) / 1000);

  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears}y ago`;
}

export function getBestThumbnail(thumbnails = [], videoId = '') {
  if (Array.isArray(thumbnails) && thumbnails.length > 0) {
    // Look for maxres or high quality, or last thumbnail in array
    const sorted = [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
    if (sorted[0]?.url) return sorted[0].url;
  }
  // Fallback to direct YouTube image cdn if videoId is given
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return '';
}
