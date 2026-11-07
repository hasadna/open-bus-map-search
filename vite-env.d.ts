/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the experimental stride-lite API. Unset → the app uses production Stride. */
  readonly VITE_STRIDE_LITE_API?: string
}
