#!/bin/bash
pnpm docker:local

cd "$(dirname "$0")"
cd ..
docker-compose -f docker-compose.ete.yml up -d

echo "Sleeping for 5s..."
sleep 10

pnpm prisma migrate deploy

CI=true pnpm vitest src/__test__/ete/ --globals
VITEST_EXIT_CODE=$?

# docker-compose -f docker-compose.ete.yml down

exit $VITEST_EXIT_CODE
