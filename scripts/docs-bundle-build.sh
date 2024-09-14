if [ "$VERCEL_ENV" == "preview" ]; then
  DEPS=$(pnpm list --filter=@fern-ui/docs-bundle --json | jq -r '.[].dependencies | to_entries[] | select(.value.version | test("link:")) | .key')
  exit 1
else
  exit 0
fi
