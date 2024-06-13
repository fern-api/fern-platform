#!/bin/sh
prisma migrate deploy --schema /app/servers/fdr/prisma/schema.prisma
node --experimental-specifier-resolution=node --loader ts-node/esm /app/servers/fdr/dist/server.js