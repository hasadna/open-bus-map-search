import babel from '@rolldown/plugin-babel'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

/**
 * The Content-Security-Policy production serves.
 *
 * KEEP IN SYNC with the `add_header Content-Security-Policy` line in the `location /`
 * block of `nginx-default.conf` — nginx is what actually serves it in production; this
 * copy only exists so a violation shows up on `npm start` / `npm run serve` instead of
 * after deploy. Nothing generates one from the other, so a change to either must be
 * mirrored by hand. Per-directive rationale lives next to the nginx line — read it
 * there before touching a source list here.
 */
const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", 'https://www.google-analytics.com', 'https://www.googletagmanager.com'],
  'style-src': ["'self'"],
  'style-src-elem': ["'self'", "'unsafe-inline'"],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.openstreetmap.fr',
    'https://*.openstreetmap.org',
    'https://www.google-analytics.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.hasadna.org.il',
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://www.googletagmanager.com',
  ],
  'frame-src': [
    "'self'",
    'https://www.youtube.com',
    'https://www.youtube-nocookie.com',
    'https://docs.google.com',
  ],
  'worker-src': ["'self'", 'blob:'],
  'frame-ancestors': ["'self'"],
}

/**
 * What `npm start` adds on top — production must never have any of it. `npm run serve`
 * (vite preview) serves the built output under the unrelaxed policy above, so it stays a
 * faithful local stand-in for nginx.
 */
const DEV_ONLY_DIRECTIVES: Record<string, string[]> = {
  // @vitejs/plugin-react injects the react-refresh preamble as an inline <script>. Relaxing
  // script-src-elem rather than script-src (as the nginx /storybook/ block does) keeps inline
  // event handlers blocked in dev too, since script-src-elem does not inherit from script-src.
  'script-src-elem': [...CSP_DIRECTIVES['script-src'], "'unsafe-inline'"],
  // HMR websocket. Chromium reads 'self' as covering a same-origin ws://, but not every
  // browser does, and a dev-only ws: costs no coverage of the https hosts above.
  'connect-src': ['ws:'],
}

const cspHeader = (extraDirectives: Record<string, string[]> = {}) => {
  const merged = { ...CSP_DIRECTIVES }
  for (const [directive, sources] of Object.entries(extraDirectives)) {
    merged[directive] = [...(merged[directive] ?? []), ...sources]
  }
  return Object.entries(merged)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')};`)
    .join(' ')
}

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
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.spec.*' /* do not include playwright files */,
      ],
    },
  }
})
