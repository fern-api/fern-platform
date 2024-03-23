# Fern Platform

The Fern Platform repository contains all of Fern's closed-source services
and frontends.

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
