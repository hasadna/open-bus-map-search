import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import IstanbulPlugin from 'vite-plugin-istanbul'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: './', // env?.VITE_BASE_PATH,
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
