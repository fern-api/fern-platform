#!/bin/bash
cd "$(dirname "$0")"
cd ..
docker-compose -f docker-compose.test.yml up -d

echo "Sleeping for 5s..."
sleep 5

pnpm prisma migrate deploy

pnpm jest -i src/__test__/db/
JEST_EXIT_CODE=$?

docker-compose -f docker-compose.test.yml down

exit $JEST_EXIT_CODE
