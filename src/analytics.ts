import ReactGAImport from 'react-ga4'
import { isStrideLiteSelected } from 'src/api/strideLite'

// react-ga4's default export is nested under `.default` under some CJS/ESM interop
// (e.g. Vite/Rolldown), so unwrap it to keep the shared singleton.
export const ReactGA =
  (ReactGAImport as unknown as { default?: typeof ReactGAImport }).default ?? ReactGAImport

/** Sent with every pageview, so GA can split usage between the two Stride backends. */
export const apiBackend = () => (isStrideLiteSelected() ? 'stride-lite' : 'production')
