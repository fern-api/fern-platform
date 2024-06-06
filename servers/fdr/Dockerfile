FROM node:18.18.0-alpine

RUN apk add --no-cache libc6-compat
RUN apk update

RUN npm install -g prisma

COPY servers/fdr fdr

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ENTRYPOINT ["/bin/sh", "fdr/srcipts/run.sh"]
