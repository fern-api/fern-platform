import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";

export const IMDB_API_DEFINITION: FernRegistry.api.v1.read.ApiDefinition = {
  id: FernRegistry.ApiDefinitionId("api_imdb"),
  types: {
    [FernRegistry.TypeId("type_imdb:MovieId")]: {
      description: "The unique identifier for a Movie in the database",
      name: "MovieId",
      shape: {
        type: "alias",
        value: {
          type: "primitive",
          value: {
            type: "string",
            format: undefined,
            regex: undefined,
            default: undefined,
            minLength: undefined,
            maxLength: undefined,
          },
        },
      },
      availability: undefined,
    },
    [FernRegistry.TypeId("type_imdb:Movie")]: {
      name: "Movie",
      shape: {
        type: "object",
        extraProperties: undefined,
        extends: [],
        properties: [
          {
            key: FernRegistry.PropertyKey("id"),
            valueType: {
              type: "id",
              value: FernRegistry.TypeId("type_imdb:MovieId"),
              default: undefined,
            },
            availability: undefined,
            description: undefined,
          },
          {
            key: FernRegistry.PropertyKey("title"),
            valueType: {
              type: "primitive",
              value: {
                type: "string",
                format: undefined,
                regex: undefined,
                default: undefined,
                minLength: undefined,
                maxLength: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
          {
            description: "The rating scale out of ten stars",
            key: FernRegistry.PropertyKey("rating"),
            valueType: {
              type: "primitive",
              value: {
                type: "double",
                minimum: undefined,
                maximum: undefined,
                default: undefined,
              },
            },
            availability: undefined,
          },
        ],
      },
      availability: undefined,
      description: undefined,
    },
    [FernRegistry.TypeId("type_imdb:DetailedMovieReview")]: {
      name: "DetailedMovieReview",
      shape: {
        type: "object",
        extraProperties: undefined,
        extends: [],
        properties: [
          {
            key: FernRegistry.PropertyKey("summary"),
            valueType: {
              type: "primitive",
              value: {
                type: "string",
                format: undefined,
                regex: undefined,
                default: undefined,
                minLength: undefined,
                maxLength: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
          {
            key: FernRegistry.PropertyKey("notes"),
            valueType: {
              type: "primitive",
              value: {
                type: "string",
                format: undefined,
                regex: undefined,
                default: undefined,
                minLength: undefined,
                maxLength: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
          {
            key: FernRegistry.PropertyKey("stars"),
            valueType: {
              type: "primitive",
              value: {
                type: "double",
                minimum: undefined,
                maximum: undefined,
                default: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
        ],
      },
      availability: undefined,
      description: undefined,
    },
    [FernRegistry.TypeId("type_imdb:AgressiveMovieReview")]: {
      name: "AgressiveMovieReview",
      shape: {
        type: "object",
        extraProperties: undefined,
        extends: [],
        properties: [
          {
            key: FernRegistry.PropertyKey("reallyAngrySummary"),
            valueType: {
              type: "primitive",
              value: {
                type: "string",
                format: undefined,
                regex: undefined,
                default: undefined,
                minLength: undefined,
                maxLength: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
          {
            key: FernRegistry.PropertyKey("notes"),
            valueType: {
              type: "primitive",
              value: {
                type: "string",
                format: undefined,
                regex: undefined,
                default: undefined,
                minLength: undefined,
                maxLength: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
          {
            key: FernRegistry.PropertyKey("stars"),
            valueType: {
              type: "primitive",
              value: {
                type: "double",
                minimum: undefined,
                maximum: undefined,
                default: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
        ],
      },
      availability: undefined,
      description: undefined,
    },
    [FernRegistry.TypeId("type_imdb:MovieReview")]: {
      name: "MovieReview",
      shape: {
        type: "undiscriminatedUnion",
        variants: [
          {
            type: {
              type: "primitive",
              value: {
                type: "string",
                format: undefined,
                regex: undefined,
                default: undefined,
                minLength: undefined,
                maxLength: undefined,
              },
            },
            availability: undefined,
            description: undefined,
            displayName: undefined,
          },
          {
            type: {
              type: "primitive",
              value: {
                type: "double",
                minimum: undefined,
                maximum: undefined,
                default: undefined,
              },
            },
            availability: undefined,
            description: undefined,
            displayName: undefined,
          },
          {
            type: {
              type: "id",
              value: FernRegistry.TypeId("type_imdb:DetailedMovieReview"),
              default: undefined,
            },
            availability: undefined,
            description: undefined,
            displayName: undefined,
          },
          {
            type: {
              type: "id",
              value: FernRegistry.TypeId("type_imdb:AgressiveMovieReview"),
              default: undefined,
            },
            availability: undefined,
            description: undefined,
            displayName: undefined,
          },
        ],
      },
      availability: undefined,
      description: undefined,
    },
    [FernRegistry.TypeId("type_imdb:CreateMovieRequest")]: {
      name: "CreateMovieRequest",
      shape: {
        type: "object",
        extraProperties: undefined,
        extends: [],
        properties: [
          {
            key: FernRegistry.PropertyKey("title"),
            valueType: {
              type: "primitive",
              value: {
                type: "string",
                format: undefined,
                regex: undefined,
                default: undefined,
                minLength: undefined,
                maxLength: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
          {
            key: FernRegistry.PropertyKey("rating"),
            valueType: {
              type: "primitive",
              value: {
                type: "double",
                minimum: undefined,
                maximum: undefined,
                default: undefined,
              },
            },
            availability: undefined,
            description: undefined,
          },
          {
            key: FernRegistry.PropertyKey("review"),
            valueType: {
              type: "id",
              value: FernRegistry.TypeId("type_imdb:MovieReview"),
              default: undefined,
            },
            availability: undefined,
            description: undefined,
          },
        ],
      },
      availability: undefined,
      description: undefined,
    },
  },
  subpackages: {
    [FernRegistry.api.v1.SubpackageId("subpackage_imdb")]: {
      subpackageId: FernRegistry.api.v1.SubpackageId("subpackage_imdb"),
      name: "imdb",
      urlSlug: "imdb",
      endpoints: [
        {
          environments: [],
          urlSlug: "123",
          errors: [],
          authed: false,
          description: "Add a movie to the database",
          method: "POST",
          id: FernRegistry.EndpointId("createMovie"),
          originalEndpointId: "endpoint_imdb.createMovie",
          name: "Create Movie",
          path: {
            pathParameters: [],
            parts: [
              {
                type: "literal",
                value: "/movies",
              },
              {
                type: "literal",
                value: "/create-movie",
              },
            ],
          },
          queryParameters: [],
          headers: [],
          request: {
            contentType: "application/json",
            type: {
              type: "reference",
              value: {
                type: "id",
                value: FernRegistry.TypeId("type_imdb:CreateMovieRequest"),
                default: undefined,
              },
            },
            description: undefined,
          },
          response: {
            type: {
              type: "reference",
              value: {
                type: "id",
                value: FernRegistry.TypeId("type_imdb:MovieId"),
                default: undefined,
              },
            },
            statusCode: undefined,
            description: undefined,
          },
          errorsV2: [],
          examples: [],

          availability: undefined,
          migratedFromUrlSlugs: undefined,
          defaultEnvironment: undefined,
          snippetTemplates: undefined,
        },
      ],
      webhooks: [],
      websockets: [],
      types: [
        FernRegistry.TypeId("type_imdb:MovieId"),
        FernRegistry.TypeId("type_imdb:Movie"),
        FernRegistry.TypeId("type_imdb:DetailedMovieReview"),
        FernRegistry.TypeId("type_imdb:AgressiveMovieReview"),
        FernRegistry.TypeId("type_imdb:MovieReview"),
        FernRegistry.TypeId("type_imdb:CreateMovieRequest"),
      ],
      subpackages: [],
      parent: undefined,
      displayName: undefined,
      description: undefined,
      pointsTo: undefined,
    },
  },
  rootPackage: {
    endpoints: [],
    webhooks: [],
    websockets: [],
    types: [],
    subpackages: [FernRegistry.api.v1.SubpackageId("subpackage_imdb")],
    pointsTo: undefined,
  },
  globalHeaders: [],
  auth: undefined,
  hasMultipleBaseUrls: undefined,
  navigation: undefined,
};
