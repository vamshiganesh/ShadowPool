### My Instructions:

# Part 14 — Frontend Integration Layer

## Instruction to Cursor

Now connect the existing frontend (`src/`) to the real deployed contracts and the browser-side commitment computation.

This is the integration layer between the polished UI built in Parts 1–8 and the real on-chain protocol.

Do not redesign any screens.
Do not change any visual components.
Only add the data and interaction layer beneath them.

---

## Install frontend dependencies

```bash
npm install wagmi viem @tanstack/react-query circomlibjs
npm install -D @types/circomlibjs
```

---

## Write `src/lib/crypto/commitment.ts`

This must produce identical hashes to `prover/src/commitment.ts`.
The input field order is canonical: [assetAmount, limitPrice, nonce, salt]

```typescript
import { buildPoseidon } from "circomlibjs";

let poseidonInstance: Awaited<ReturnType<typeof buildPoseidon>> | null = null;

async function getPoseidon() {
  if (!poseidonInstance) {
    poseidonInstance = await buildPoseidon();
  }
  return poseidonInstance;
}

export interface OrderInput {
  assetAmount: bigint;  // 18 decimal fixed-point (ETH)
  limitPrice: bigint;   // 6 decimal fixed-point (USDC)
  nonce: bigint;        // random 128-bit integer
  salt: bigint;         // uint256 entropy
}

/// Compute Poseidon commitment for a private order.
/// This runs entirely in the browser via circomlibjs WASM.
/// No network request is made.
export async function computeCommitment(order: OrderInput): Promise<string> {
  const poseidon = await getPoseidon();
  const F = poseidon.F;

  const hash = poseidon([
    order.assetAmount,
    order.limitPrice,
    order.nonce,
    order.salt,
  ]);

  return "0x" + F.toString(hash, 16).padStart(64, "0");
}

/// Generate a secure random nonce
export function generateNonce(): bigint {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return BigInt("0x" + Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join(""));
}

/// Generate a secure random salt
export function generateSalt(): bigint {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return BigInt("0x" + Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join(""));
}
```

---

## Write `src/lib/crypto/useCommitment.ts`

```typescript
import { useState, useEffect, useRef } from "react";
import { computeCommitment, generateNonce, generateSalt, type OrderInput } from "./commitment";

interface CommitmentState {
  hash: string | null;
  isComputing: boolean;
  error: string | null;
  nonce: bigint;
  salt: bigint;
}

/// React hook that computes a Poseidon commitment in real-time as the user types.
/// This drives the animated commitment hash in the order entry form.
export function useCommitment(assetAmount: string, limitPrice: string) {
  const [state, setState] = useState<CommitmentState>({
    hash: null,
    isComputing: false,
    error: null,
    nonce: generateNonce(),
    salt: generateSalt(),
  });

  const nonceRef = useRef(state.nonce);
  const saltRef = useRef(state.salt);

  useEffect(() => {
    if (!assetAmount || !limitPrice) {
      setState(s => ({ ...s, hash: null, error: null }));
      return;
    }

    let cancelled = false;
    setState(s => ({ ...s, isComputing: true, error: null }));

    const compute = async () => {
      try {
        const order: OrderInput = {
          assetAmount: BigInt(Math.round(parseFloat(assetAmount) * 1e18)),
          limitPrice: BigInt(Math.round(parseFloat(limitPrice) * 1e6)),
          nonce: nonceRef.current,
          salt: saltRef.current,
        };

        const hash = await computeCommitment(order);
        if (!cancelled) {
          setState(s => ({ ...s, hash, isComputing: false }));
        }
      } catch (e) {
        if (!cancelled) {
          setState(s => ({
            ...s,
            hash: null,
            isComputing: false,
            error: "Commitment computation failed"
          }));
        }
      }
    };

    const debounce = setTimeout(compute, 300);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [assetAmount, limitPrice]);

  return state;
}
```

---

## Write `src/lib/contracts/useOrderBook.ts`

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import addresses from "../../../shared/addresses.json";

const ORDER_BOOK_ABI = [
  {
    name: "submitCommitment",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "commitment", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "cancelCommitment",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "commitment", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "getOpenCommitments",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32[]" }],
  },
] as const;

export function useSubmitCommitment() {
  const { writeContractAsync, isPending, data: txHash } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const submit = async (commitmentHash: string, escrowEth: string) => {
    return writeContractAsync({
      address: addresses.orderBook as `0x${string}`,
      abi: ORDER_BOOK_ABI,
      functionName: "submitCommitment",
      args: [commitmentHash as `0x${string}`],
      value: parseEther(escrowEth),
    });
  };

  return {
    submit,
    isPending,
    isConfirming,
    isSuccess,
    txHash,
  };
}
```

---

## Write `src/app/providers/WagmiProvider.tsx`

```typescript
import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected } from "wagmi/connectors";

const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

---

## Wire the commitment hook into the order form

In `src/features/trade/` or wherever the order entry panel lives:

1. Import `useCommitment` and `useSubmitCommitment`
2. Wire the `assetAmount` and `limitPrice` form inputs to `useCommitment`
3. Display the live-updating commitment hash in the `CommitmentHashBox` component
4. The hash should update with a subtle scramble-to-resolve animation as the user types
5. On form submit, call `useSubmitCommitment().submit(hash, escrowEth)`

The scramble animation on the commitment hash is the single most memorable interaction in the demo.
It must be implemented properly — not faked with static text.

Implement it as:
- while `isComputing === true`: animate the hash characters scrambling (random hex chars replacing each position rapidly)
- when `isComputing === false` and `hash !== null`: resolve to the final hash with a smooth transition

---

## Add `VITE_SEPOLIA_RPC_URL` to `.env.example`

```env
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

---

## Deliverables for this phase

1. Confirm `src/lib/crypto/commitment.ts` input order matches the circuit exactly
2. Confirm `useCommitment` debounces correctly and cancels stale computations
3. Confirm `useSubmitCommitment` uses the address from `shared/addresses.json`
4. Confirm `Web3Provider` wraps the app router in `src/main.tsx`
5. Confirm the scramble-resolve animation is working on the order form hash box
6. Confirm no hardcoded addresses appear in any frontend file

---

# End of Part 14

---


### Received Output:

Part 14 is done. The frontend now talks to real contracts and computes commitments in-browser.

What was added
File	Purpose
src/lib/crypto/commitment.ts
Browser Poseidon hashing via circomlibjs (same format as prover/src/commitment.ts)
src/lib/crypto/useCommitment.ts
Debounced hook (300ms) with stale-computation cancellation
src/lib/contracts/useOrderBook.ts
useSubmitCommitment — reads address from shared/addresses.json
src/app/providers/WagmiProvider.tsx
wagmi v2 + viem + React Query on Sepolia
src/vite-env.d.ts
Types for VITE_SEPOLIA_RPC_URL
What was wired (no screen redesigns)
OrderEntryPanel — useCommitment(amount, price) drives the hash box; "Commit Order" calls submit(hash, escrowEth) via wagmi
MobileTradeScreen — same integration
CommitmentHashBox — scramble animation while computing, left-to-right resolve when done
main.tsx — wrapped in <Web3Provider>
tradeStore — removed mock commitmentHash (now computed live)
Deliverables confirmed
Poseidon input order: [assetAmount, limitPrice, nonce, salt] — matches circuit + prover
useCommitment debounces at 300ms and cancels stale async work
useSubmitCommitment uses shared/addresses.json — no hardcoded contract addresses
Web3Provider wraps the app in main.tsx
Scramble-resolve animation implemented in CommitmentHashBox
npm run build passes cleanly
Setup
Copy .env.example → .env and set:

VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

After deploying contracts, update shared/addresses.json with the real orderBook address.

Part 14 is complete. The frontend integration layer is in place:

- **Browser commitments** — `src/lib/crypto/commitment.ts` computes Poseidon hashes with the same input order and formatting as the prover/circuit
- **Live order form** — `useCommitment` debounces input and drives the scramble-to-resolve hash animation in `CommitmentHashBox`
- **On-chain submit** — `useSubmitCommitment` calls `OrderBook.submitCommitment` using the address from `shared/addresses.json`
- **Web3 setup** — wagmi v2 + viem + React Query wrapped in `Web3Provider` in `main.tsx`
- **Build** — `npm run build` passes

To run it locally, set `VITE_SEPOLIA_RPC_URL` in `.env` and populate `shared/addresses.json` after deployment.