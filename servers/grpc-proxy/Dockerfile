FROM node:18.18.0-alpine AS base

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update

WORKDIR /app
RUN npm install -g turbo@2.0.1
COPY . .
RUN turbo prune @fern-platform/grpc-proxy --docker

ENTRYPOINT ["node", "--experimental-specifier-resolution=node", "/app/servers/fdr/dist/server.js"]