import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import IstanbulPlugin from 'vite-plugin-istanbul'

const ASSET_URL = process.env.ASSET_URL || ''

// https://vitejs.dev/config/
export default defineConfig({
  base: ASSET_URL,
  plugins: [
    react(),
    ...(process.env.USE_BABEL_PLUGIN_ISTANBUL
      ? [
          IstanbulPlugin({
            include: 'src/*',
            exclude: ['node_modules', 'test/'],
            extension: ['.js', '.ts', '.tsx'],
          }),
        ]
      : []),
  ],
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
