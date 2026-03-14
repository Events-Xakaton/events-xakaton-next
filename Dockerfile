# ─── Stage 1: Dependencies ─────────────────────────────────────────────────
FROM node:22-slim AS deps
WORKDIR /app

RUN npm config set strict-ssl false

COPY package*.json ./
RUN npm install -f

# ─── Stage 2: Build ────────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* встраиваются в JS на этапе сборки — передаём как ARG
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN npm run build

# ─── Stage 3: Runtime ──────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app

# libjemalloc2 — оптимизация аллокатора памяти (обязателен)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libjemalloc2 \
    && rm -rf /var/lib/apt/lists/*

ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Непривилегированный пользователь
RUN addgroup --system nodejs && adduser --system --ingroup nodejs nextjs

# standalone build содержит минимальный набор node_modules
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
