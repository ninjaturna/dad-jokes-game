/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_GOOGLE_MAPS_KEY?: string
  readonly VITE_HOST_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
