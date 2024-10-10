import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk/client/types";

export const IMDB_API_DEFINITION: APIV1Read.ApiDefinition = {
    id: FdrAPI.ApiDefinitionId("api_imdb"),
    types: {
        [APIV1Read.TypeId("type_imdb:MovieId")]: {
            description: "The unique identifier for a Movie in the database",
            name: "MovieId",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "string",
                        regex: undefined,
                        default: undefined,
                        minLength: undefined,
                        maxLength: undefined,
                    },
                },
            },
            availability: undefined,
        },
        [APIV1Read.TypeId("type_imdb:Movie")]: {
            name: "Movie",
            shape: {
                type: "object",
                extraProperties: undefined,
                extends: [],
                properties: [
                    {
                        key: APIV1Read.PropertyKey("id"),
                        valueType: {
                            type: "id",
                            value: APIV1Read.TypeId("type_imdb:MovieId"),
                            default: undefined,
                        },
                        availability: undefined,
                        description: undefined,
                    },
                    {
                        key: APIV1Read.PropertyKey("title"),
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
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
                        key: APIV1Read.PropertyKey("rating"),
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
        [APIV1Read.TypeId("type_imdb:DetailedMovieReview")]: {
            name: "DetailedMovieReview",
            shape: {
                type: "object",
                extraProperties: undefined,
                extends: [],
                properties: [
                    {
                        key: APIV1Read.PropertyKey("summary"),
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
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
                        key: APIV1Read.PropertyKey("notes"),
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
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
                        key: APIV1Read.PropertyKey("stars"),
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
        [APIV1Read.TypeId("type_imdb:AgressiveMovieReview")]: {
            name: "AgressiveMovieReview",
            shape: {
                type: "object",
                extraProperties: undefined,
                extends: [],
                properties: [
                    {
                        key: APIV1Read.PropertyKey("reallyAngrySummary"),
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
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
                        key: APIV1Read.PropertyKey("notes"),
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
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
                        key: APIV1Read.PropertyKey("stars"),
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
        [APIV1Read.TypeId("type_imdb:MovieReview")]: {
            name: "MovieReview",
            shape: {
                type: "undiscriminatedUnion",
                variants: [
                    {
                        type: {
                            type: "primitive",
                            value: {
                                type: "string",
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
                            value: APIV1Read.TypeId("type_imdb:DetailedMovieReview"),
                            default: undefined,
                        },
                        availability: undefined,
                        description: undefined,
                        displayName: undefined,
                    },
                    {
                        type: {
                            type: "id",
                            value: APIV1Read.TypeId("type_imdb:AgressiveMovieReview"),
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
        [APIV1Read.TypeId("type_imdb:CreateMovieRequest")]: {
            name: "CreateMovieRequest",
            shape: {
                type: "object",
                extraProperties: undefined,
                extends: [],
                properties: [
                    {
                        key: APIV1Read.PropertyKey("title"),
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
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
                        key: APIV1Read.PropertyKey("rating"),
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
                        key: APIV1Read.PropertyKey("review"),
                        valueType: {
                            type: "id",
                            value: APIV1Read.TypeId("type_imdb:MovieReview"),
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
        [APIV1Read.SubpackageId("subpackage_imdb")]: {
            subpackageId: APIV1Read.SubpackageId("subpackage_imdb"),
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
                    id: FdrAPI.EndpointId("createMovie"),
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
                                value: APIV1Read.TypeId("type_imdb:CreateMovieRequest"),
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
                                value: APIV1Read.TypeId("type_imdb:MovieId"),
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
                APIV1Read.TypeId("type_imdb:MovieId"),
                APIV1Read.TypeId("type_imdb:Movie"),
                APIV1Read.TypeId("type_imdb:DetailedMovieReview"),
                APIV1Read.TypeId("type_imdb:AgressiveMovieReview"),
                APIV1Read.TypeId("type_imdb:MovieReview"),
                APIV1Read.TypeId("type_imdb:CreateMovieRequest"),
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
        subpackages: [APIV1Read.SubpackageId("subpackage_imdb")],
        pointsTo: undefined,
    },
    globalHeaders: [],
    auth: undefined,
    hasMultipleBaseUrls: undefined,
    navigation: undefined,
};
