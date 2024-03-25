#!/bin/bash
cd "$(dirname "$0")"
cd ..
docker-compose -f docker-compose.test.yml up -d

echo "Sleeping for 5s..."
sleep 5

pnpm prisma migrate deploy

CI=true pnpm vitest src/__test__/db/ --globals
VITEST_EXIT_CODE=$?

docker-compose -f docker-compose.test.yml down

exit $VITEST_EXIT_CODE
