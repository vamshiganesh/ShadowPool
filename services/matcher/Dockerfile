FROM node:20-slim AS base
WORKDIR /app

# ── Build prover first (shares circuit files in /app/circuits) ─────────
COPY prover/package*.json ./prover/
RUN cd prover && npm ci

COPY prover/src ./prover/src
COPY prover/tsconfig.json ./prover/
RUN cd prover && npm run build

# ── Build matcher service ──────────────────────────────────────────────
COPY services/matcher/package*.json ./services/matcher/
RUN cd services/matcher && npm ci --only=production

COPY services/matcher/src ./services/matcher/src
COPY services/matcher/tsconfig.json ./services/matcher/
RUN cd services/matcher && npx tsc

# ── Copy shared assets ─────────────────────────────────────────────────
COPY shared ./shared
COPY circuits/build ./circuits/build

# ── Runtime image ─────────────────────────────────────────────────────
FROM node:20-slim AS runtime
WORKDIR /app

COPY --from=base /app/prover/dist        ./prover/dist
COPY --from=base /app/prover/node_modules ./prover/node_modules
COPY --from=base /app/services/matcher/dist ./services/matcher/dist
COPY --from=base /app/services/matcher/node_modules ./services/matcher/node_modules
COPY --from=base /app/shared ./shared
COPY --from=base /app/circuits/build ./circuits/build

ENV NODE_ENV=production
WORKDIR /app/services/matcher
EXPOSE 3001

CMD ["node", "dist/index.js"]
