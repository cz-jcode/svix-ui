/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SVIX_BASE_URL: string
  readonly VITE_SVIX_TOKEN: string
  readonly VITE_SVIX_SAVE_TOKEN: string
  readonly PACKAGE_VERSION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
