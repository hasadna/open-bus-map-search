import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

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
    ],
    resolve: {
      alias: {
        src: '/src',
      },
    },
    css: {
      transformer: 'lightningcss',
    },
    define: {
      'process.env.VITE_STRIDE_API': JSON.stringify(env.VITE_STRIDE_API ?? ''),
      'process.env.VITE_BACKEND_API': JSON.stringify(env.VITE_BACKEND_API ?? ''),
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
