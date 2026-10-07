import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
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
