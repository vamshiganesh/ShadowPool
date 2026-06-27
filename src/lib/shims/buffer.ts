import { Buffer as BufferPolyfill } from 'buffer'

// circomlibjs → blake-hash expects Node's global Buffer in the browser.
;(globalThis as typeof globalThis & { Buffer: typeof BufferPolyfill }).Buffer =
  BufferPolyfill
