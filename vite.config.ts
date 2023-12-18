import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const ASSET_URL = process.env.ASSET_URL || ''

// https://vitejs.dev/config/
export default defineConfig({
  base: ASSET_URL,
  plugins: [react()],
  resolve: {
    alias: {
      src: '/src',
    },
  },
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './setupTests.ts',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.spec.*' /* do not include playwright files */,
    ],
  },
})
