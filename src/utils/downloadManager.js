export async function startBackgroundDownload(video, onComplete, onError) {
  const videoId = video.videoId || video.id;
  const title = video.title || 'VoidTube Video';

  // 1. Try to get direct format stream first
  const formatStreams = video.formatStreams || [];
  const hdStream = formatStreams.find(f => f.resolution === '720p' && f.container === 'mp4') || formatStreams.find(f => f.resolution === '720p');
  
  let finalUrl = hdStream?.url;

  if (finalUrl && finalUrl.includes('.googlevideo.com')) {
    // If it's a direct stream, we can pass it to Android.
    // However, googlevideo.com might not trigger a download in the browser, just playback.
    // So we append a dummy parameter or just use it.
    finalUrl = finalUrl + '&dl=1';
  } else {
    // 2. Fetch using loader.to API
    try {
      // Init download
      const initUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=720&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`;
      const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(initUrl)}`);
      
      if (res.ok) {
        const initData = await res.json();
        
        if (initData && (initData.progress_url || initData.id)) {
          const pollUrl = initData.progress_url || `https://lto2.affadaffa.com/api/progress?id=${initData.id}`;
          
          // Poll until download_url is ready
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 1000));
            try {
              const pRes = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(pollUrl)}`);
              const pData = await pRes.json();
              
              if (pData?.download_url && pData.success === 1) {
                finalUrl = pData.download_url;
                break;
              }
            } catch (err) {
              console.warn('Poll error:', err);
            }
          }
        } else if (initData?.download_url) {
          finalUrl = initData.download_url;
        }
      }
    } catch (e) {
      console.warn('API fetch failed:', e);
    }
  }

  // 3. Fallback: Our own Next.js API
  if (!finalUrl) {
    try {
      const qs = new URLSearchParams({ action: 'init', videoId, format: '720' }).toString();
      const apiRes = await fetch(`https://voidtube-one.vercel.app/api/download?${qs}`);
      const apiData = await apiRes.json();
      if (apiData?.download_url) finalUrl = apiData.download_url;
    } catch(e) {}
  }

  // 4. Give up or Trigger Download
  if (!finalUrl) {
    if (onError) onError(videoId);
    return;
  }

  // THIS IS THE MAGIC FOR ANDROID NATIVE DOWNLOAD
  // It opens the link in the system browser/downloader outside the webview.
  // The system browser will immediately download it to the Downloads folder
  // and show the native Android notification!
  window.open(finalUrl, '_system');

  if (onComplete) {
    onComplete({
      videoId,
      title,
      quality: '720p HD',
      url: finalUrl,
      downloadedAt: new Date().toISOString()
    });
  }
}
