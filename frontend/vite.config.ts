import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: '/Users/dipukumari/Documents/akpandeya/flashcards/frontend/node_modules/react',
      'react-dom': '/Users/dipukumari/Documents/akpandeya/flashcards/frontend/node_modules/react-dom'
    }
  },
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: []
  }
})
