# Fern Bot

> [!NOTE]
>
> This was created via Cloudflare's Wrangle CLI, so linking that documentation here for SA: https://developers.cloudflare.com/workers/wrangler/
>
> And here's more Worker propoganda https://developers.cloudflare.com/workers/

- Publish: `pnpm deploy`
- Local run: `pnpm dev`

## Local Development

Note that if you want to pass in real variables while developing, you can fill them in within `.dev.vars` which is automatically bound to the environment when you run `pnpm dev`.

https://developers.cloudflare.com/pages/functions/bindings/#environment-variables

### Test Scheduled Tasks

https://developers.cloudflare.com/workers/configuration/cron-triggers/#test-cron-triggers
