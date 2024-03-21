#!/bin/bash
cd "$(dirname "$0")"
cd ..
docker-compose -f docker-compose.ete.yml up -d

echo "Sleeping for 5s..."
sleep 5

yarn prisma migrate deploy

yarn jest -i src/__test__/ete/
JEST_EXIT_CODE=$?

docker-compose -f docker-compose.ete.yml down

exit $JEST_EXIT_CODE
