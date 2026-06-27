/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SEPOLIA_RPC_URL: string
  readonly VITE_INDEXER_RPC_URL?: string
  readonly VITE_DEPLOYMENT_BLOCK?: string
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
