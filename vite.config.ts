import { URL, fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  server: { host: '127.0.0.1', port: 8000, strictPort: true },
  preview: { host: '127.0.0.1', port: 8000, strictPort: true },
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          domain: ['./src/domain/index.ts'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@domain': fileURLToPath(new URL('./src/domain', import.meta.url)),
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
    },
  },
});
