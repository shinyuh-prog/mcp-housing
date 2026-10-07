import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

// Serves files in /api as Vercel-style functions (`export function GET(request)`) during local dev.
// On Vercel, the /api directory is deployed as Functions automatically.
function vercelApiDevPlugin(): Plugin {
  const apiDir = path.resolve(__dirname, 'api');
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z0-9-]+)\/?(?:\?|$)/i);
        if (!match) return next();
        const file = path.join(apiDir, `${match[1]}.js`);
        if (!fs.existsSync(file)) return next();

        try {
          const mod = await server.ssrLoadModule(file);
          const method = (req.method || 'GET').toUpperCase();
          const handler = mod[method] ?? (method === 'HEAD' ? mod.GET : undefined);
          if (typeof handler !== 'function') {
            res.statusCode = 405;
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].filter((m) => mod[m]).join(', '));
            res.end();
            return;
          }

          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const request = new Request(`http://${req.headers.host || 'localhost'}${req.url}`, {
            method,
            headers: req.headers as Record<string, string>,
            body: ['GET', 'HEAD'].includes(method) || chunks.length === 0 ? undefined : Buffer.concat(chunks),
          });

          const response: Response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(method === 'HEAD' ? undefined : Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.config.logger.error(`[api] ${req.url} failed: ${(error as Error).message}`);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Internal Server Error' }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), vercelApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Proxy to bypass CORS for Data.gov.sg public datasets
      proxy: {
        '/api/datagov': {
          target: 'https://data.gov.sg',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/datagov/, ''),
        },
        '/api/datagov-meta': {
          target: 'https://api-production.data.gov.sg',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/datagov-meta/, ''),
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
