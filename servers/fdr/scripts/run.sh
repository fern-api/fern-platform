#!/bin/sh
prisma migrate deploy --schema /app/servers/fdr/prisma/schema.prisma
node --experimental-specifier-resolution=node /app/servers/fdr/dist/server.js