/**
 * Prover worker.
 *
 * Polls Supabase for 'proving' match jobs, decrypts the order secrets,
 * delegates to the existing ShadowPool Groth16 prover (prover/dist/index.js),
 * and writes the settlement tx hash back to the database.
 *
 * The prover runs as a child process so CPU-intensive snarkjs work does not
 * block the Fastify event loop.
 */
import { spawn } from 'child_process'
import { resolve } from 'path'
import { env, isSubmitEnabled } from '../env'
import {
  getPendingJobs,
  getSecretByHash,
  setOrderStatus,
  resolveJob,
  failJob,
} from '../db/queries'
import type { SecretPayload } from '../db/queries'

// Resolved path to the built prover entry point (prover/dist/service-entry.js)
const PROVER_ENTRY = resolve(__dirname, '../../../../prover/dist/service-entry.js')

interface PoolEntry {
  commitmentHash: string
  assetAmount: string
  limitPrice: string
  nonce: string
  salt: string
  trader: string
  escrowAmount: string
  submittedBlock: number
}

function toPoolEntry(secret: SecretPayload): PoolEntry {
  return {
    commitmentHash: secret.commitmentHash,
    assetAmount: secret.assetAmount,
    limitPrice: secret.limitPrice,
    nonce: secret.nonce,
    salt: secret.salt,
    trader: secret.trader,
    escrowAmount: secret.assetAmount, // conservative: same as amount
    submittedBlock: 0,
  }
}

/**
 * Run the Groth16 prover + on-chain submitter in a child process.
 * Returns { txHash, blockNumber } on success.
 */
async function runProverProcess(
  entries: PoolEntry[],
): Promise<{ txHash: string; blockNumber: number }> {
  const poolJson = JSON.stringify(entries)

  return new Promise((resolve, reject) => {
    const child = spawn(
      'node',
      [PROVER_ENTRY],
      {
        env: {
          ...process.env,
          SEPOLIA_RPC_URL: env.SEPOLIA_RPC_URL,
          PROVER_PRIVATE_KEY: env.PROVER_PRIVATE_KEY,
          SUBMIT_ON_CHAIN: isSubmitEnabled() ? '1' : '0',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (d: Buffer) => {
      const line = d.toString()
      stdout += line
      console.log('[worker/prover]', line.trim())
    })

    child.stderr.on('data', (d: Buffer) => {
      stderr += d.toString()
    })

    // Write pool JSON to prover stdin
    child.stdin.write(poolJson)
    child.stdin.end()

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Prover exited ${code}: ${stderr.slice(0, 400)}`))
        return
      }

      // Extract tx hash from stdout: "[submitter] Tx hash: 0x…"
      const hashMatch = stdout.match(/Tx hash:\s*(0x[0-9a-fA-F]{64})/)
      const blockMatch = stdout.match(/Settled at block\s+(\d+)/)

      if (!hashMatch) {
        // submit=0 mode — proof succeeded but no tx
        resolve({ txHash: '0x' + '0'.repeat(64), blockNumber: 0 })
        return
      }

      resolve({
        txHash: hashMatch[1],
        blockNumber: blockMatch ? parseInt(blockMatch[1], 10) : 0,
      })
    })

    child.on('error', reject)
  })
}

async function processNextJob(): Promise<void> {
  const jobs = await getPendingJobs()
  if (jobs.length === 0) return

  // Process one job at a time (proving is CPU-intensive)
  const job = jobs[0]
  console.log(`[worker] Processing job ${job.id}: ${job.commitment_a} ↔ ${job.commitment_b}`)

  const [secretA, secretB] = await Promise.all([
    getSecretByHash(job.commitment_a),
    getSecretByHash(job.commitment_b),
  ])

  if (!secretA || !secretB) {
    await failJob(job.id, 'Could not decrypt one or both secrets')
    return
  }

  // Mark as actively proving
  await Promise.all([
    setOrderStatus(job.commitment_a, 'proving'),
    setOrderStatus(job.commitment_b, 'proving'),
  ])

  const entries = [toPoolEntry(secretA), toPoolEntry(secretB)]

  try {
    const { txHash, blockNumber } = await runProverProcess(entries)
    await resolveJob(job.id, txHash, blockNumber, job.commitment_a, job.commitment_b)
    console.log(`[worker] Job ${job.id} settled — tx ${txHash}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[worker] Job ${job.id} failed:`, message)

    await failJob(job.id, message)
    await Promise.all([
      setOrderStatus(job.commitment_a, 'failed', { error: message }),
      setOrderStatus(job.commitment_b, 'failed', { error: message }),
    ])
  }
}

export function startWorker(intervalMs: number): NodeJS.Timeout {
  console.log(`[worker] Starting — polling every ${intervalMs / 1000}s`)

  // Run once at startup then on interval
  void processNextJob()
  return setInterval(() => {
    void processNextJob()
  }, intervalMs)
}
