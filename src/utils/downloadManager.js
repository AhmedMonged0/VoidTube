export async function startBackgroundDownload(video, onComplete, onError) {
  const videoId = video.videoId || video.id;
  const title = video.title || 'VoidTube Video';

  let finalUrl = null;

  // 1. Try our direct high-performance Vercel serverless API
  try {
    const qs = new URLSearchParams({ action: 'init', videoId, format: '720' }).toString();
    const initRes = await fetch(`https://voidtube-one.vercel.app/api/download?${qs}`);
    
    if (initRes.ok) {
      const initData = await initRes.json();
      
      if (initData?.download_url) {
        finalUrl = initData.download_url;
      } else if (initData?.progress_url) {
        // Poll for completion (up to 30 attempts, ~35 seconds)
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          try {
            const pQs = new URLSearchParams({ 
              action: 'progress', 
              url: initData.progress_url 
            }).toString();
            
            const pRes = await fetch(`https://voidtube-one.vercel.app/api/download?${pQs}`);
            if (pRes.ok) {
              const pData = await pRes.json();
              if (pData?.download_url && pData.success === 1) {
                finalUrl = pData.download_url;
                break;
              }
            }
          } catch (pollErr) {
            console.warn('Poll error:', pollErr);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Backend download service error:', err);
  }

  // 2. Direct formatStream fallback if available
  if (!finalUrl && video.formatStreams && video.formatStreams.length > 0) {
    const hdStream = video.formatStreams.find(f => f.resolution === '720p' && f.container === 'mp4') 
                  || video.formatStreams.find(f => f.resolution === '720p')
                  || video.formatStreams[0];
    if (hdStream?.url) {
      finalUrl = hdStream.url.includes('?') ? `${hdStream.url}&dl=1` : `${hdStream.url}?dl=1`;
    }
  }

  // 3. If failed to obtain link
  if (!finalUrl) {
    if (onError) onError(videoId);
    return;
  }

  // 4. Trigger download to phone/system
  const cleanTitle = (title || 'video').replace(/[/\\?%*:|"<>]/g, '_');
  try {
    const link = document.createElement('a');
    link.href = finalUrl;
    link.setAttribute('download', `${cleanTitle}.mp4`);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (linkErr) {
    console.warn('Anchor trigger error:', linkErr);
  }

  // Also trigger window.open for native Capacitor system interception
  try {
    window.open(finalUrl, '_system');
  } catch (winErr) {
    console.warn('Window open error:', winErr);
  }

  // 5. Notify success with full video info
  if (onComplete) {
    onComplete({
      ...video,
      id: videoId,
      videoId,
      title,
      thumbnail: video.thumbnail || video.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      author: video.author || video.authorName || 'قناة يوتيوب',
      lengthSeconds: video.lengthSeconds || 0,
      quality: '720p HD',
      url: finalUrl,
      downloadedAt: new Date().toISOString()
    });
  }
}
