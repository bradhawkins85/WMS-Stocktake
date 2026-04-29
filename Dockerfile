# syntax=docker/dockerfile:1
# ────────────────────────────────────────────────────────────────────────────────
# Stage 1 – deps: install production + dev dependencies
# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

# ────────────────────────────────────────────────────────────────────────────────
# Stage 2 – builder: generate Prisma client and build Next.js
# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (no DB connection needed at build time)
RUN npx prisma generate

# Build Next.js with output: standalone
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Provide placeholder values so the build does not fail on env-var checks;
# the real values are supplied at runtime via docker-compose / deploy.sh.
ENV DATABASE_URL="file:/tmp/placeholder.db"
ENV NEXTAUTH_SECRET="build-time-placeholder"
ENV NEXTAUTH_URL="http://localhost:3000"

RUN npm run build

# ────────────────────────────────────────────────────────────────────────────────
# Stage 3 – runner: minimal production image
# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

# Copy standalone server output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static     ./.next/static
COPY --from=builder /app/public           ./public

# Copy Prisma schema + generated client so migrations can run at startup
COPY --from=builder /app/prisma           ./prisma
COPY --from=builder /app/node_modules/.prisma          ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma          ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma           ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin             ./node_modules/.bin

# Copy seed script dependencies
COPY --from=builder /app/node_modules/bcryptjs         ./node_modules/bcryptjs
COPY --from=builder /app/node_modules/@types/bcryptjs  ./node_modules/@types/bcryptjs
COPY --from=builder /app/node_modules/ts-node          ./node_modules/ts-node
COPY --from=builder /app/node_modules/typescript       ./node_modules/typescript
COPY --from=builder /app/node_modules/@swc             ./node_modules/@swc
COPY --from=builder /app/tsconfig.json                 ./tsconfig.json
COPY --from=builder /app/package.json                  ./package.json

# Persistent data directory (mount as a named volume in docker-compose)
RUN mkdir -p /data && chown nextjs:nodejs /data

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# DATABASE_URL, NEXTAUTH_SECRET, and NEXTAUTH_URL must be supplied at runtime.
# The entrypoint runs migrations before starting the server.
CMD ["sh", "-c", "set -e; npx prisma migrate deploy && npx prisma db seed && node server.js"]
