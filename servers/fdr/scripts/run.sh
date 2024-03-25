#!/bin/sh
npm install -g prisma
prisma migrate deploy --schema /app/servers/fdr/prisma/schema.prisma
node /app/servers/fdr/dist/server.js