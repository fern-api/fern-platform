#!/bin/sh
prisma migrate deploy --schema /fdr/prisma/schema.prisma
node --experimental-specifier-resolution=node /fdr/dist/server.js