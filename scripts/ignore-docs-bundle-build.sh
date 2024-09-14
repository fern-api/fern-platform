if [ "$VERCEL_ENV" == "preview" ]; then
  PATH=$(pnpm list --filter=@fern-ui/docs-bundle --depth -1 --json | jq -r '.[].path')

  if [ "$(git diff --quiet HEAD^ HEAD -- $PATH)" ]; then
    exit 1
  fi

  DEPS=$(pnpm list --filter=@fern-ui/docs-bundle --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .path] | unique | .[]')

  if [ -n "$DEPS" ]; then
    for DEP in $DEPS; do
      if [ "$(git diff --quiet HEAD^ HEAD -- $DEP)" ]; then
        exit 1
      fi
    done
  fi

else
  exit 0
fi
