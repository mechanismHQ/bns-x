# Install dependencies only when needed
FROM node:18-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app
# COPY . .

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# RUN pnpm fetch --prod

COPY api/package.json api/
COPY web/package.json web/
COPY packages/core/package.json packages/core/
COPY packages/client/package.json packages/client/
COPY web/patches ./web/patches

COPY . .

RUN pnpm install --prod --frozen-lockfile

# If using npm with a `package-lock.json` comment out above and use below instead
# RUN npm ci

ENV NEXT_TELEMETRY_DISABLED 1

# Add `ARG` instructions below if you need `NEXT_PUBLIC_` variables
# then put the value on your fly.toml
# Example:
# ARG NEXT_PUBLIC_EXAMPLE="value here"
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_NETWORK_KEY
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_NETWORK_KEY=${NEXT_PUBLIC_NETWORK_KEY}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install -g pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app ./

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["pnpm", "web:prod"]

# If using npm comment out above and use below instead
# CMD ["npm", "run", "start"]
