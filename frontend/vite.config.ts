import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' 
    ? '/' 
    : '/',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Prevent websocket import in browser
      'websocket': path.resolve(__dirname, './src/util/websocket-stub.ts')
    },
  },
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['stompjs', 'sockjs-client']
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      exclude: ['websocket']
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 30173,
      port: 5173
    },
    watch: {
      usePolling: true
    }
  },
  define: {
    global: 'globalThis',
  }
}))
