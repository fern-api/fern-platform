#!/bin/bash
cd playwright/fixtures/$1
node /Users/rohinbhargava/fern-pull-test/fern/packages/cli/cli/dist/prod/bundle.cjs docs dev --port $2 --bundle-path ../../../packages/ui/local-preview-bundle/out