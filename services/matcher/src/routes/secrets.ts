/**
 * POST /v1/secrets
 *
 * Called by the frontend immediately after a commitment is confirmed on-chain.
 * The request body contains the order's private inputs (nonce, salt, amounts)
 * and a signature proving the caller controls the committing wallet.
 *
 * Security model:
 *   - We verify the Ethereum signature so only the real trader can upload secrets.
 *   - Secrets are AES-256-GCM encrypted before hitting Supabase.
 *   - The prover wallet is separate from all trader wallets.
 */
import type { FastifyInstance } from 'fastify'
import { ethers } from 'ethers'
import { upsertOrderSecret } from '../db/queries'
import { triggerMatch } from '../engine/matcher'

interface SecretsBody {
  commitmentHash: string
  assetAmount: string       // wei decimal string (BigInt-safe)
  limitPrice: string        // micro-USDC decimal string
  nonce: string
  salt: string
  trader: string            // 0x… wallet address
  /** EIP-191 personal_sign over keccak256(commitmentHash ++ nonce) for auth */
  signature: string
}

function buildSignedMessage(commitmentHash: string, nonce: string): string {
  // Deterministic message the frontend must sign
  return `ShadowPool secret upload\ncommitment: ${commitmentHash}\nnonce: ${nonce}`
}

export async function secretRoutes(app: FastifyInstance) {
  app.post<{ Body: SecretsBody }>(
    '/v1/secrets',
    {
      schema: {
        body: {
          type: 'object',
          required: [
            'commitmentHash',
            'assetAmount',
            'limitPrice',
            'nonce',
            'salt',
            'trader',
            'signature',
          ],
          properties: {
            commitmentHash: { type: 'string', pattern: '^0x[0-9a-fA-F]{64}$' },
            assetAmount:    { type: 'string' },
            limitPrice:     { type: 'string' },
            nonce:          { type: 'string' },
            salt:           { type: 'string' },
            trader:         { type: 'string', pattern: '^0x[0-9a-fA-F]{40}$' },
            signature:      { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { commitmentHash, assetAmount, limitPrice, nonce, salt, trader, signature } =
        request.body

      // ── Signature verification ────────────────────────────────────────────
      const message = buildSignedMessage(commitmentHash, nonce)
      let recovered: string
      try {
        recovered = ethers.verifyMessage(message, signature)
      } catch {
        return reply.status(400).send({ error: 'Invalid signature format' })
      }

      if (recovered.toLowerCase() !== trader.toLowerCase()) {
        return reply.status(403).send({
          error: 'Signature does not match trader address',
          recovered,
          expected: trader,
        })
      }

      // ── Persist encrypted secrets ─────────────────────────────────────────
      try {
        await upsertOrderSecret({
          commitmentHash,
          assetAmount,
          limitPrice,
          nonce,
          salt,
          trader,
        })
      } catch (err) {
        app.log.error({ err, commitmentHash }, '[secrets] Failed to persist')
        return reply.status(500).send({ error: 'Storage failure' })
      }

      // ── Optimistic match trigger (non-blocking) ───────────────────────────
      triggerMatch().catch((err) =>
        app.log.warn({ err }, '[secrets] Background match trigger failed'),
      )

      return reply.status(201).send({ success: true, status: 'pending' })
    },
  )
}
