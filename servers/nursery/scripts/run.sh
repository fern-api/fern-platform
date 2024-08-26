#!/bin/sh
npm install -g prisma
prisma migrate deploy --schema /app/servers/nursery/prisma/schema.prisma
node --experimental-specifier-resolution=node /app/servers/nursery/dist/server.js