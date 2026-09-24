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
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), downloadProxyPlugin()],
})

