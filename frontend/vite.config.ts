import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // Enable all polyfills for WebTorrent compatibility
      include: ['buffer', 'process', 'stream', 'events', 'util', 'crypto', 'path'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Add explicit aliases for problematic Node.js modules
      'stream': 'stream-browserify',
      'buffer': 'buffer',
    },
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
    include: ['webtorrent'], // Pre-bundle webtorrent
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        // Ensure all dependencies are bundled
        manualChunks: undefined,
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
})
