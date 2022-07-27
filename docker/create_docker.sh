#!/usr/bin/env bash

set -e

TAG="$1"
DOCKER_NAME=fern-definition-registry:"$TAG"

PACKAGE_DIR="$(pwd)"
DOCKER_DIR="$PACKAGE_DIR/docker"
WEBPACK_CONFIG="$DOCKER_DIR/webpack.config.js"

webpack_mode="production"
if [[ "$TAG" == "local" ]]; then
webpack_mode="development"
fi

yarn
yarn compile
yarn webpack --config "$WEBPACK_CONFIG" --mode "$webpack_mode"
docker build -f "$DOCKER_DIR/Dockerfile" -t "$DOCKER_NAME" "$DOCKER_DIR"

mkdir -p "$DOCKER_DIR/build/tar/"
docker save "$DOCKER_NAME" -o ../build/tar/"$DOCKER_NAME".tar

echo
echo "Built docker: $DOCKER_NAME"
echo "To run image: docker run $DOCKER_NAME"
echo