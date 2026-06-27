/**
 * ShadowPool Matcher Service
 *
 * Fastify API that:
 *  1. Receives order secrets from the frontend (POST /v1/secrets)
 *  2. Watches the OrderBook contract for CommitmentSubmitted events
 *  3. Matches crossing bid/ask pairs server-side
 *  4. Runs the Groth16 prover + settlement submission in a child process
 *  5. Exposes lifecycle status (GET /v1/status/:hash) for the frontend stepper
 *
 * Stack: Fastify + Supabase (Postgres) + viem + snarkjs (via prover child process)
 */
import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'

import { env } from './env'
import { healthRoutes } from './routes/health'
import { secretRoutes } from './routes/secrets'
import { statusRoutes } from './routes/status'
import { startChainWatcher } from './chain/watcher'
import { startWorker } from './engine/worker'
import { triggerMatch } from './engine/matcher'

async function bootstrap() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })

  // ── Security ─────────────────────────────────────────────────────────────
  await app.register(helmet, { global: true })
  await app.register(cors, {
    origin: [env.FRONTEND_URL],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // ── Routes ───────────────────────────────────────────────────────────────
  await app.register(healthRoutes)
  await app.register(secretRoutes)
  await app.register(statusRoutes)

  // ── Chain watcher (WebSocket subscription) ───────────────────────────────
  const stopWatcher = startChainWatcher()

  // ── Prover worker (polling loop) ─────────────────────────────────────────
  const workerTimer = startWorker(env.WORKER_INTERVAL_MS)

  // ── Periodic match scan (catches gaps if events were missed) ─────────────
  const matchTimer = setInterval(
    () => triggerMatch().catch((e) => app.log.error(e)),
    env.MATCH_INTERVAL_MS,
  )

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    app.log.info(`[server] ${signal} received — shutting down`)
    clearInterval(workerTimer)
    clearInterval(matchTimer)
    stopWatcher()
    await app.close()
    process.exit(0)
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))

  // ── Start listening ───────────────────────────────────────────────────────
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`[server] ShadowPool matcher service listening on :${env.PORT}`)
}

bootstrap().catch((err) => {
  console.error('[server] Fatal startup error:', err)
  process.exit(1)
})
