#!/usr/bin/env bash

set -e

TAG="$1"
DOCKER_NAME=fern-definition-registry:"$TAG"

PACKAGE_DIR="$(pwd)"
DOCKER_DIR="$PACKAGE_DIR"

docker build -f "$DOCKER_DIR/Dockerfile" -t "$DOCKER_NAME" "$DOCKER_DIR" --build-arg DATABASE_URL=${DATABASE_URL}

mkdir -p "$DOCKER_DIR/docker/build/tar/"
docker save "$DOCKER_NAME" -o "$DOCKER_DIR/docker/build/tar/$DOCKER_NAME.tar"

echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo
