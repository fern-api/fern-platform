FROM node:18.18.0-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

# Produce a pruned version of the monorepo
WORKDIR /app
# Install pnpm
RUN npm install -g turbo
COPY . .
RUN turbo prune @fern-platform/fdr --docker

# Add lockfile and package.json's
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
RUN npm install -g pnpm@v8.15.4 fern-api
WORKDIR /app

# Install deps
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml .
RUN pnpm install

ARG FERN_TOKEN
ENV FERN_TOKEN=$FERN_TOKEN

# Build
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY shared shared
COPY fern fern
RUN pnpm --filter=@fern-platform/fdr run compile 

FROM base AS runner
WORKDIR /app

RUN npm install -g prisma

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY --from=installer /app .

ENTRYPOINT ["/bin/sh", "/app/servers/fdr/scripts/run.sh"]
