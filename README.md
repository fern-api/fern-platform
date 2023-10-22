# Fern Definition Registry

This repo contains the backend code for the Fern Definition Registry (FDR) as well as the packages/SDKs associated with it. This project is a TypeScript monorepo that uses [Yarn](https://yarnpkg.com) workspaces with [Turbo](https://turbo.build) as the build system. The interface of the FDR API is defined in Fern. The application that serves the API is `fdr`, which runs on AWS ([ECS](https://aws.amazon.com/ecs/)) in a Dockerized format.

## Getting Started

### Pre-requisites

- Make sure Node.js 18+ and Yarn are installed on your machine
- Make sure you have fern-api installed: `npm install -g fern-api`

Once you've cloned the repo to your favourite directory run `yarn` from project root. This will install the dependencies for all workspaces.

### Directory Structure

The primary directories that you should be familiar with when working on this project are:

- `/apps`: Contains applications (deployables) where each application is a workspace.
- `/fern`: Contains the Fern Definition (API spec) and SDK generators for FDR.
- `/packages`: Contains packages that are used by apps and possibly other packages.

### Scripts

The root-level scripts run with Turbo are cached to speed up subsequent executions. By default, Turbo executes a given script
in each workspace wherein it has been defined. The `--filter` flag can be used to run a script in a specific workspace.

#### `build`

Builds all apps and packages.

```bash
yarn build
```

To build specifically the `fdr` app run. To build the FDR app you first need to generate Fern SDKs by running `fern generate`.

```bash
yarn build:fdr
```

#### `lint`

Lints all workspaces.

```bash
yarn lint
```

#### `format`

Runs format check in each workspace.

```bash
yarn format
```

#### `test`

Runs test in each workspace.

```bash
yarn test
```
