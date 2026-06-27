/**
 * AES-256-GCM encryption for order secrets stored in Supabase.
 *
 * Format: base64(iv [16 bytes] || authTag [16 bytes] || ciphertext)
 *
 * A new random IV is generated per encryption so the same plaintext
 * never produces the same ciphertext.
 */
import {
  createCipheriv,
  createDecipheriv,
  scryptSync,
  randomBytes,
} from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LEN = 32
const IV_LEN = 16
const TAG_LEN = 16
const SALT = 'shadowpool-matcher-v1'

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, SALT, KEY_LEN)
}

export function encrypt(plaintext: string, secret: string): string {
  const key = deriveKey(secret)
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decrypt(ciphertext: string, secret: string): string {
  const key = deriveKey(secret)
  const buf = Buffer.from(ciphertext, 'base64')

  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const encrypted = buf.subarray(IV_LEN + TAG_LEN)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]).toString('utf8')
}
