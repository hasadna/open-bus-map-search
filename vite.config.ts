import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'
import { cspHeader, DEV_ONLY_DIRECTIVES } from './csp'

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
      headers: { 'Content-Security-Policy': cspHeader(DEV_ONLY_DIRECTIVES) },
    },
    preview: {
      headers: { 'Content-Security-Policy': cspHeader() },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './setupTests.ts',
      // *.test.* is Vitest, *.spec.* is Playwright — never pick up the latter.
      include: ['**/*.test.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      server: {
        deps: {
          // MUI's ESM build imports react-transition-group through legacy
          // directory paths ('…/TransitionGroupContext'), which node's ESM
          // loader rejects. Inlining hands those packages to Vite's resolver
          // instead — add any further @mui package that trips the same error.
          inline: [/@mui\/(material|x-date-pickers|x-tree-view)/],
        },
      },
      coverage: {
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: [
          'src/svgLoader.d.ts',
          'src/{test_pages,complaint}/**',
          'src/pages/DataResearch/**',
          'src/pages/homepage/**',
          '**/*.{test,spec,config,stories}.*',
        ],
      },
    },
  }
})
