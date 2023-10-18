FROM node:18.18.0-alpine AS base
ENV DEBUG=express:*

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

# Produce a pruned version of the monorepo
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune fdr --docker

# Add lockfile and package.json's
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# Install deps
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install

# Build
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build --filter=fdr

FROM base AS runner
WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY --from=installer /app .

CMD node apps/fdr/dist/server.js
