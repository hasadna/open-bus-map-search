/**
 * The Content-Security-Policy production serves.
 *
 * nginx is what actually serves it in production (the `location /` block of
 * `nginx-default.conf`); this copy exists so a violation shows up on `npm start` /
 * `npm run serve` instead of after deploy. The two are asserted byte-identical by
 * `csp.test.ts`, so a change here that isn't mirrored there — or the reverse — fails CI.
 * Per-directive rationale lives next to the nginx line; read it before touching a source
 * list here.
 */
export const CSP_DIRECTIVES: Record<string, string[]> = {
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
    'https://avatars.githubusercontent.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.hasadna.org.il',
    'https://www.google-analytics.com',
    'https://region1.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://api.github.com',
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
export const DEV_ONLY_DIRECTIVES: Record<string, string[]> = {
  // @vitejs/plugin-react injects the react-refresh preamble as an inline <script>. Relaxing
  // script-src-elem rather than script-src (as the nginx /storybook/ block does) keeps inline
  // event handlers blocked in dev too, since script-src-elem does not inherit from script-src.
  'script-src-elem': [...CSP_DIRECTIVES['script-src'], "'unsafe-inline'"],
  // HMR websocket. Chromium reads 'self' as covering a same-origin ws://, but not every
  // browser does, and a dev-only ws: costs no coverage of the https hosts above.
  'connect-src': ['ws:'],
}

export const cspHeader = (extraDirectives: Record<string, string[]> = {}) => {
  const merged = { ...CSP_DIRECTIVES }
  for (const [directive, sources] of Object.entries(extraDirectives)) {
    merged[directive] = [...(merged[directive] ?? []), ...sources]
  }
  return Object.entries(merged)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')};`)
    .join(' ')
}
