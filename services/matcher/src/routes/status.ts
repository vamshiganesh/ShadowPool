/**
 * GET /v1/status/:hash
 *
 * Lightweight polling endpoint for the frontend lifecycle tracker.
 * Returns the current settlement status for a commitment hash.
 */
import type { FastifyInstance } from 'fastify'
import { getOrderStatus } from '../db/queries'

interface Params {
  hash: string
}

export async function statusRoutes(app: FastifyInstance) {
  app.get<{ Params: Params }>(
    '/v1/status/:hash',
    {
      schema: {
        params: {
          type: 'object',
          required: ['hash'],
          properties: {
            hash: { type: 'string', pattern: '^0x[0-9a-fA-F]{64}$' },
          },
        },
      },
    },
    async (request, reply) => {
      const { hash } = request.params
      const row = await getOrderStatus(hash)

      if (!row) {
        return reply.status(404).send({ error: 'Commitment not found in matcher pool' })
      }

      return reply.send({
        commitmentHash: hash,
        status: row.status,
        txHash: row.tx_hash ?? null,
        matchedAt: row.matched_at ?? null,
        settledAt: row.settled_at ?? null,
        error: row.error ?? null,
      })
    },
  )
}
