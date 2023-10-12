### Install

```bash
npm install -g fern-api
```

### Already have an OpenAPI spec?

Import your OpenAPI spec into Fern [here](./spec/openapi).

### The `fern/` directory

The `fern/` directory contains your Fern configuration. This generally lives in your
backend repo, but you can also have an independent repo dedicated to your API (like [Seam's](https://github.com/seamapi/fern-config)).

In the root of your repo, run:

```bash
fern init
```

This will create the following folder structure in your project:

```yaml
fern/
├─ fern.config.json # root-level configuration
└─ api/ # your API
  ├─ generators.yml # generators you're using
  └─ definition/
    ├─ api.yml  # API-level configuration
    └─ imdb.yml # endpoints, types, and errors
```

### Generating an SDK

To generate the TypeScript SDK and an OpenAPI spec, run:

```bash
fern generate
```

By default, `generators.yml` is configured to generate a TypeScript SDK and an
OpenAPI spec. You can read more about generation on the [`fern generate`](./compiler/fern-generate) 
page.

### Defining your API

<Accordion title="Example API">

```yaml imdb.yml
types:
  MovieId: string

  Movie:
    properties:
      id: MovieId
      title: string
      rating:
        type: double
        docs: The rating scale is one to five stars

  CreateMovieRequest:
    properties:
      title: string
      rating: double

service:
  auth: false
  base-path: /movies
  endpoints:
    createMovie:
      docs: Add a movie to the database
      method: POST
      path: /create-movie
      request: CreateMovieRequest
      response: MovieId

    getMovie:
      method: GET
      path: /{movieId}
      path-parameters:
        movieId: MovieId
      response: Movie
      errors:
        - MovieDoesNotExistError

errors:
  MovieDoesNotExistError:
    status-code: 404
    type: MovieId
```

</Accordion>

Your **Fern definition** is a set of YAML files that describe your API. You can
learn more about this in the [Define your API](./definition/definition) section.

### Running the Fern compiler

The Fern compiler takes your Fern definition and generates useful outputs, like
SDKs. You can learn more about configuring outputs in the [Compiler](./compiler/generators)
section.
