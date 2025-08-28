import react from '@vitejs/plugin-react-oxc'
import { loadEnv } from 'vite'
import IstanbulPlugin from 'vite-plugin-istanbul'
import { defineConfig } from 'vitest/config'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: env?.ASSET_URL || '',
    plugins: [
      react(),
      ...(env?.VITE_COVERAGE
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
    build: {
      cssMinify: 'lightningcss',
    },
    define: {
      'process.env': env,
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
  }
})
