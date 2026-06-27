import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
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
})
