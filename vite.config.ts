import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
/// <reference types="vitest" />

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // DevTools uniquement en développement (évite ~500 KB en prod)
    ...(mode === 'development' ? [vueDevTools()] : []),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Minification rapide via esbuild (supprime ~3,5 Mo de JS non-minifié)
    minify: 'esbuild',
    // Fractionner le CSS par chunk (évite un gros bundle CSS bloquant)
    cssCodeSplit: true,
    // Ne pas inclure les sourcemaps en production
    sourcemap: false,
    rollupOptions: {
      output: {
        // Découpage manuel des vendors pour améliorer le cache navigateur
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'axios': ['axios'],
        },
        // Noms de fichiers avec hash pour cache-busting automatique
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Configuration Vitest
  test: {
    environment: 'jsdom',
    globals: true,
  },
}))
