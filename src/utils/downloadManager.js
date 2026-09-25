import { saveVideo } from './indexedDB';

export async function startBackgroundDownload(video, onComplete, onError) {
  const videoId = video.videoId || video.id;
  const title = video.title || 'VoidTube Video';
  const author = video.author || video.authorName || 'VoidTube Channel';
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  
  // Try to find a direct stream from video object if available
  const formatStreams = video.formatStreams || [];
  const hdStream = formatStreams.find(f => f.resolution === '720p' && f.container === 'mp4') || formatStreams.find(f => f.resolution === '720p');
  const sdStream = formatStreams.find(f => f.resolution === '360p' && f.container === 'mp4') || formatStreams.find(f => f.resolution === '360p') || formatStreams[0];
  
  const directUrl = hdStream?.url || sdStream?.url;
  let finalUrl = directUrl;

  const fetchApiSafe = async (action, extraParams = {}) => {
    const endpoints = [
      () => {
        const qs = new URLSearchParams({ action, ...extraParams }).toString();
        return `https://voidtube-one.vercel.app/api/download?${qs}`;
      },
      () => {
        if (action === 'init') {
          const raw = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${extraParams.format || '720'}&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${extraParams.videoId}`)}`;
          return `https://corsproxy.io/?url=${encodeURIComponent(raw)}`;
        } else {
          return `https://corsproxy.io/?url=${encodeURIComponent(extraParams.url)}`;
        }
      }
    ];

    for (const getUrl of endpoints) {
      try {
        const r = await fetch(getUrl());
        if (r.ok) {
          const d = await r.json();
          if (d && (d.progress_url || d.download_url || d.id || d.success !== undefined)) return d;
        }
      } catch (_) {}
    }
    return null;
  };

  if (!finalUrl || !finalUrl.includes('.googlevideo.com')) {
    // Need to get direct URL from API
    try {
      const initData = await fetchApiSafe('init', { videoId, format: '720' });
      if (initData) {
        if (initData.download_url) {
          finalUrl = initData.download_url;
        } else if (initData.progress_url || initData.id) {
          const pollUrl = initData.progress_url || `https://lto2.affadaffa.com/api/progress?id=${initData.id}`;
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 1100));
            const pData = await fetchApiSafe('progress', { url: pollUrl });
            if (pData?.download_url && pData.success === 1) {
              finalUrl = pData.download_url;
              break;
            }
          }
        }
      }
    } catch (e) {
      console.warn('API fetch failed:', e);
    }
  }

  if (!finalUrl) {
    if (onError) onError(videoId);
    return;
  }

  // Now we have finalUrl, fetch the blob and save to IndexedDB
  try {
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(finalUrl)}`);
    if (res.ok) {
      const blob = await res.blob();
      const videoObj = {
        id: videoId + '_' + Date.now(),
        videoId,
        title,
        author,
        thumbnail,
        blob,
        quality: hdStream ? '720p HD' : '360p MP4',
        fileSize: 'Video',
        url: finalUrl,
        downloadedAt: new Date().toISOString()
      };
      await saveVideo(videoObj);
      if (onComplete) onComplete(videoObj);
      return;
    }
  } catch (err) {
    console.warn('Blob fetch failed:', err);
  }
  
  if (onError) onError(videoId);
}
