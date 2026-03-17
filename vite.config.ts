import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import IstanbulPlugin from 'vite-plugin-istanbul'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: env?.VITE_BASE_PATH || '/',
    plugins: [
      react(),
      babel({
        presets: [reactCompilerPreset()],
      }),
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
    css: {
      transformer: 'lightningcss',
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
