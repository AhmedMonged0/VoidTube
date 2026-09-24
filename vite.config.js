import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import https from 'https'
import http from 'http'
import { URL } from 'url'

function downloadProxyPlugin() {
  return {
    name: 'download-proxy',
    configureServer(server) {
      server.middlewares.use('/api/download-file', (req, res) => {
        try {
          const reqUrl = new URL(req.url, 'http://localhost:5173');
          const targetUrl = reqUrl.searchParams.get('url');
          const rawName = reqUrl.searchParams.get('name') || 'video';
          
          if (!targetUrl) {
            res.statusCode = 400;
            res.end('Missing url parameter');
            return;
          }

          // Clean safe filename for Windows/Android (max 50 chars, no illegal chars)
          const cleanName = rawName.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 50).trim();
          const baseName = cleanName.replace(/\.mp4$/i, '');
          const filename = `${baseName}.mp4`;
          const asciiFallback = baseName.replace(/[^\x20-\x7E]/g, '').trim() || 'VoidTube_Video';

          const targetParsed = new URL(targetUrl);
          const client = targetParsed.protocol === 'https:' ? https : http;

          const proxyReq = client.get(targetUrl, (proxyRes) => {
            // Handle redirects if any
            if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers.location) {
              const redirectUrl = new URL(proxyRes.headers.location, targetUrl).href;
              res.writeHead(302, { Location: `/api/download-file?url=${encodeURIComponent(redirectUrl)}&name=${encodeURIComponent(rawName)}` });
              res.end();
              return;
            }

            res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'video/mp4');
            res.setHeader(
              'Content-Disposition',
              `attachment; filename="${asciiFallback}.mp4"; filename*=UTF-8''${encodeURIComponent(filename)}`
            );
            if (proxyRes.headers['content-length']) {
              res.setHeader('Content-Length', proxyRes.headers['content-length']);
            }

            proxyRes.pipe(res);
          });

          proxyReq.on('error', (err) => {
            console.error('Download proxy error:', err);
            if (!res.headersSent) {
              res.statusCode = 502;
              res.end('Failed to fetch video stream');
            }
          });

          req.on('close', () => {
            proxyReq.destroy();
          });
        } catch (e) {
          console.error('Proxy handler error:', e);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.end('Internal server error');
          }
        }
      });

      server.middlewares.use('/api/download', async (req, res) => {
        try {
          const reqUrl = new URL(req.url, 'http://localhost:5173');
          const action = reqUrl.searchParams.get('action');
          const videoId = reqUrl.searchParams.get('videoId');
          const format = reqUrl.searchParams.get('format') || '720';
          const targetUrl = reqUrl.searchParams.get('url');

          const fetchJsonHelper = (urlToFetch) => {
            return new Promise((resolve, reject) => {
              const parsed = new URL(urlToFetch);
              const client = parsed.protocol === 'https:' ? https : http;
              const r = client.get(urlToFetch, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'application/json, text/plain, */*'
                }
              }, (response) => {
                let d = '';
                response.on('data', chunk => d += chunk);
                response.on('end', () => {
                  try { resolve(JSON.parse(d)); } catch(e) { resolve({ error: 'Failed to parse JSON', raw: d }); }
                });
              });
              r.on('error', reject);
              r.setTimeout(12000, () => { r.destroy(); reject(new Error('Timeout')); });
            });
          };

          if (action === 'init' && videoId) {
            const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
            const apiUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${format}&url=${encodeURIComponent(ytUrl)}`;
            const data = await fetchJsonHelper(apiUrl);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }

          if (action === 'progress' && targetUrl) {
            const data = await fetchJsonHelper(targetUrl);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return;
          }

          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid parameters' }));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), downloadProxyPlugin()],
})

