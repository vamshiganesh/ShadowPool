# ShadowPool

ZK dark pool trading on Ethereum Sepolia. Orders enter as cryptographic commitments, an off chain matcher pairs them privately, Groth16 proofs validate the match, and settlement executes atomically on chain.

**[Setup and deployment guide: DEPLOY.md](./DEPLOY.md)**

That guide covers local development, the two wallet settlement demo, Vercel frontend deploy, matcher setup, Supabase, and troubleshooting. Start there if you are cloning the repo or preparing a demo.

## Links

| | |
|---|---|
| **Setup guide** | [DEPLOY.md](./DEPLOY.md) |
| **Matcher service** | [services/matcher/README.md](./services/matcher/README.md) |
| **Contracts** | [contracts/README.md](./contracts/README.md) |
| **Live app** | Deploy frontend to Vercel (see DEPLOY.md) |

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, wagmi, Tailwind |
| Matcher API | Fastify, Supabase, ethers.js |
| Prover | Circom, snarkjs (Groth16) |
| Contracts | Solidity on Sepolia |

## Quick start

```bash
git clone https://github.com/vamshiganesh/ShadowPool.git
cd ShadowPool
npm install
cp .env.example .env
# Edit .env (see DEPLOY.md for every variable)
npm run dev
```

For automated settlement, you also need Supabase and the matcher service. Full steps are in **[DEPLOY.md](./DEPLOY.md)**.

## What works where

| | Public Vercel site | Local dev with matcher |
|---|-------------------|------------------------|
| Landing, docs, UI | Yes | Yes |
| Live Sepolia feed and stats | Yes | Yes |
| Commit on chain | Yes | Yes |
| Auto match, prove, settle | No | Yes |

## License

See repository for license details.
