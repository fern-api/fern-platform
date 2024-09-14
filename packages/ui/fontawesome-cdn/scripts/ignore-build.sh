if [ "$VERCEL_ENV" == "preview" ]; then exit 0; else pnpx turbo-ignore @fern-ui/fontawesome-cdn --fallback=HEAD^1; fi
