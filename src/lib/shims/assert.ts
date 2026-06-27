/** Browser shim for Node's `assert` used by circomlibjs in Vite. */
function assert(value: unknown, message?: string): asserts value {
  if (!value) {
    throw new Error(message ?? 'Assertion failed')
  }
}

export default assert
