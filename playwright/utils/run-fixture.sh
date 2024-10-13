#!/bin/bash
cd playwright/$1
fern-dev docs dev --port $2 --bundle-path ../../packages/ui/local-preview-bundle/out