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

(If pnpm is not installed, installing specific version `9.4.0` is recommended using `curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION=9.4.0 sh -`)

### Compiling

To compile the packages in this monorepo, run `pnpm compile`.

### Tests

This repo contains both unit tests and integration (end-to-end) tests.

To run the unit tests: `pnpm test`.

To run the integration tests: `pnpm test:ete`.

Many of our tests rely on [Vite](https://vitejs.dev/) snapshots. To rewrite snapshots, use `-u`: `pnpm test -u` and `pnpm test:ete -u`.

### Docs UI

To build and run the NextJS docs UI, run:

- `vercel pull`. This pulls the latest development environment variables from Vercel.
- `vercel dev`. This compiles and runs a NextJS app that communicates with our cloud production environment.

The frontend is served at `localhost:3000`. You can configure which docs are loaded by using `.env.local`:

```bash
# packages/fern-docs/bundle/.env.local

# uncomment the next line when targeting the production cloud environment
# NEXT_PUBLIC_DOCS_DOMAIN=proficientai.docs.buildwithfern.com

# uncomment the next line when targeting the dev cloud environment
# NEXT_PUBLIC_DOCS_DOMAIN=vellum.docs.dev.buildwithfern.com

# paste all environment variables found in .vercel/.env.development.local here
```

### Docs Dev Environment

To run the docs dev environment, first make sure vercel is installed:

- `npm install -g vercel`

From the fern-platform repository, link vercel to the Fern project:

- `vercel link --project legacy.ferndocs.com`
- When prompted to setup the project, say `yes`
- When prompted what scope should contain the project, say `fern`
- When prompted to link to the project, say `yes`

Then, run `vercel pull`, which will create `/fern-platform/.vercel/.env.development.local`
Then, copy that file (creating if necessary) to `/fern-platform/packages/fern-docs/bundle/.env.local`
Finally, to run the dev server, `cd /packages/fern-docs/bundle` and run `pnpm docs:dev`, which should begin running on `localhost:3000`

To set a dev docs domain, add a `NEXT_PUBLIC_DOCS_DOMAIN` to `.env.local`. For instance:

- `NEXT_PUBLIC_DOCS_DOMAIN=customer.docs.buildwithfern.com`

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

### Create preview link

When in a demo or customer repo can run `fern generate --docs --preview` which will generate a preview URL that can be used in .env.local for developing against a specific commit or branch within the customer's repo. You need access to the customer's organization in order to run this command. If the command is failing you can run `fern generate --docs --preview --log-level debug` to get a verbose output to see why it's failing.
