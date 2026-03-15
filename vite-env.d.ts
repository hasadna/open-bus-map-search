/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string
  readonly VITE_COVERAGE?: string
  readonly VITE_STRIDE_API?: string
  readonly VITE_BACKEND_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
