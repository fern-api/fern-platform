#!/bin/bash
set -e
prisma migrate deploy --schema /app/servers/fdr/prisma/schema.prisma
node --loader /app/servers/fdr/ts-loader.js --experimental-specifier-resolution=node /app/servers/fdr/dist/server.js