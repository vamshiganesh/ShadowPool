import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const sepoliaRpc =
    env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'

  return {
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy Sepolia JSON-RPC in dev so the browser never hits Alchemy directly (CORS).
    proxy: {
      '/rpc/sepolia': {
        target: sepoliaRpc,
        changeOrigin: true,
        secure: true,
        rewrite: () => '',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // circomlibjs pulls Node's assert — provide a browser shim.
      assert: path.resolve(__dirname, './src/lib/shims/assert.ts'),
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    // Pre-bundle CJS deps from circomlibjs so default-import interop works in dev.
    include: ['buffer', 'circomlibjs', 'blake2b', 'blake-hash'],
    needsInterop: ['buffer', 'blake2b', 'blake-hash'],
  },
  define: {
    global: 'globalThis',
  },
  }
})
