# :herb: Fern Platform

The Fern Platform repository contains all of Fern's closed-source services
and frontends.

## API Definitions

All API Definitions should be defined in Fern. These definitions will be
documented in our [internal documentation website](https://fern-internal.docs.buildwithfern.com/).

To check your API Definitions run `pnpm fern check`. All Fern commands
should be prefixed with `pnpm` since our fern dependency is managed
by our workspace root.

> Note: To upgrade fern run `pnpm upgrade fern-api`.

Add a test

## Services

### FDR (Fern Definition Registry)

FDR is the backend for Fern's docs product and provides an API to
store and retrieve API Definitions as well as docs. It's API is defined
[here](./fern/apis/fdr/).

FDR is implemented as a Node.js Express server and hosted on ECS. Any PR
that is merged to main and contains changes to FDR, will automatically
be deployed to our dev stack.

To release FDR on prod, you need to tag a release with the format "fdr@<tag>"
on this repository.
