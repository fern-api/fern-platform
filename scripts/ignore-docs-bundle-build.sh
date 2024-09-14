#!/usr/bin/env sh

if [ "$VERCEL_ENV" == "preview" ]; then
  PATH=$(pnpm list --filter=@fern-ui/docs-bundle --depth -1 --json | jq -r '.[].path')

  if [ "$(git diff --quiet HEAD^ HEAD -- $PATH)" ]; then
    exit 1
  fi

  DEPS=$(pnpm list --filter=@fern-ui/docs-bundle --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .path] | unique | .[]')

  if [ "$(git diff --quiet HEAD^ HEAD -- $PATH)" ]; then
    exit 1
  fi
fi

exit 0
