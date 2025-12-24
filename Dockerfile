FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js app
# Note: Since we are using SQLite, we need to ensure the DB file is present or generated.
# For production, we should probably stick to migration deploy or volume mount.
# Here we run prisma generate to ensure client is ready.
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy built application
# Standalone build (preferred for Docker) requires next.config.js output: 'standalone'
# If not standalone, copy everything:
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and migrations if needed for runtime (or volume mount db)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy data folder if needed for seeding (optional)
COPY --from=builder --chown=nextjs:nodejs /app/data ./data

USER nextjs

EXPOSE 3000
ENV PORT 3000
# Ensure Hostname is 0.0.0.0 for Docker
ENV HOSTNAME "0.0.0.0"

# Note: We need a startup script to migrate/seed if this is a fresh volume
# For simplicity, we just run the server. 
# You should mount the sqlite file at /app/prisma/dev.db via volume.

CMD ["node", "server.js"]
