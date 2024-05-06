# Contributing

Thanks for being here! Fern gives a lot of importance to being a community project, and we rely on your help as much as you rely on ours. If you have any feedback on what we could improve, please [open an issue](https://github.com/fern-api/fern/issues/new) to discuss it!

## Opening an issue

All contributions start with [an issue](https://github.com/fern-api/fern/issues/new). Even if you have a good idea of what the problem is and what the solution looks like, please open an issue. This will give us an opportunity to align on the problem and solution, and to deconflict in the case that somebody else is already working on it.

## How can you help?

Review [our documentation](https://buildwithfern.com/docs)! We appreciate any help we can get that makes our documentation more digestible.

Talk about Fern in your local meetups! Even our users aren't always aware of some of our features. Learn, then share your knowledge with your own circles.

Write code! We've got lots of open issues - feel free to volunteer for one by commenting on the issue.

## Local development

Our repo uses [pnpm](https://pnpm.io/) to manage dependencies.

To get started:

**Step 1: Fork this repo**

Fork by clicking [here](https://github.com/fern-api/fern/fork).

**Step 2: Clone your fork and open in VSCode**

```
git clone <your fork>
cd fern
code .
```

**Step 3: Install dependencies**

```
pnpm install
```

### Compiling

To compile the packages in this monorepo, run `pnpm compile`.

### Tests

This repo contains both unit tests and integration (end-to-end) tests.

To run the unit tests: `pnpm test`.

To run the integration tests: `pnpm test:ete`.

Many of our tests rely on [Vite](https://vitejs.dev/) snapshots. To rewrite snapshots, use `-u`: `pnpm test -u` and `pnpm test:ete -u`.

### CLI

To build the CLI, run either:

- `pnpm dist:cli:dev`. This compiles and bundles a CLI that communicates with our dev cloud environment. The CLI is outputted to `packages/cli/cli/dist/dev/cli.cjs`.

- `pnpm dist:cli:prod`. This compiles and bundles a CLI that communicates with our production cloud environment. The CLI is outputted to `packages/cli/cli/dist/prod/cli.cjs`.

To run the locally-generated CLI, run:

```
FERN_NO_VERSION_REDIRECTION=true node <path to CLI> <args>
```

### Docs UI

To build and run the NextJS docs UI, run either:

- `pnpm --filter=@fern-ui/docs-bundle dev:fern-dev`. This compiles and runs a NextJS app that communicates with our dev cloud environment.

- `pnpm --filter=@fern-ui/docs-bundle dev:fern-prod`. This compiles and runs a NextJS app that communicates with our cloud production environment.

The frontend is served at `localhost:3000`. You can configure which docs are loaded by using `.env.local`:

```bash
# packages/ui/docs-bundle/.env.local

# uncomment the next line when targeting the production cloud environment
# NEXT_PUBLIC_DOCS_DOMAIN=proficientai.docs.buildwithfern.com

# uncomment the next line when targeting the dev cloud environment
# NEXT_PUBLIC_DOCS_DOMAIN=vellum.docs.dev.buildwithfern.com
```

## Testing in Staging

### PR previews

After pushing a commit to a PR, vercel will automatically generate a preview URL for that PR, i.e.

```
fern-prod-it1bn6vh9-buildwithfern.vercel.app
```

To access the preview for a given customer site, use the following pattern:

```
https://fern-prod-it1bn6vh9-buildwithfern.vercel.app/api/fern-docs/preview?site=proficientai
```

Or,

```
https://fern-prod-it1bn6vh9-buildwithfern.vercel.app/api/fern-docs/preview?host=proficientai.docs.buildwithfern.com
```

### Before deploying

Before cutting a release from `main`, we test our changes in a staging environment. All production URLs have a secret staging URL:

```
https://vellum.docs.buildwithfern.com -> https://vellum.docs.staging.buildwithfern.com
https://docs.buildwithfern.com -> https://fern.docs.staging.buildwithfern.com
https://documentation.sayari.com -> https://sayari.docs.staging.buildwithfern.com
```
