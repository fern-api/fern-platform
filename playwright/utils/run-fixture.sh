#!/bin/bash
cd playwright/$1
fern docs dev --port $2 --bundle-path ../../packages/ui/local-preview-bundle/out