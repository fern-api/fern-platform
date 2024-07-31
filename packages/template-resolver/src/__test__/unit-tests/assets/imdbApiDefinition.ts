import { APIV1Read } from "@fern-api/fdr-sdk";

export const IMDB_API_DEFINITION: APIV1Read.ApiDefinition = {
    id: "api_imdb",
    types: {
        "type_imdb:MovieId": {
            description: "The unique identifier for a Movie in the database",
            name: "MovieId",
            shape: {
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "string",
                    },
                },
            },
        },
        "type_imdb:Movie": {
            name: "Movie",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "id",
                        valueType: {
                            type: "id",
                            value: "type_imdb:MovieId",
                        },
                    },
                    {
                        key: "title",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        description: "The rating scale out of ten stars",
                        key: "rating",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "double",
                            },
                        },
                    },
                ],
            },
        },
        "type_imdb:DetailedMovieReview": {
            name: "DetailedMovieReview",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "summary",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "notes",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "stars",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "double",
                            },
                        },
                    },
                ],
            },
        },
        "type_imdb:AgressiveMovieReview": {
            name: "AgressiveMovieReview",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "reallyAngrySummary",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "notes",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "stars",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "double",
                            },
                        },
                    },
                ],
            },
        },
        "type_imdb:MovieReview": {
            name: "MovieReview",
            shape: {
                type: "undiscriminatedUnion",
                variants: [
                    {
                        type: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        type: {
                            type: "primitive",
                            value: {
                                type: "double",
                            },
                        },
                    },
                    {
                        type: {
                            type: "id",
                            value: "type_imdb:DetailedMovieReview",
                        },
                    },
                    {
                        type: {
                            type: "id",
                            value: "type_imdb:AgressiveMovieReview",
                        },
                    },
                ],
            },
        },
        "type_imdb:CreateMovieRequest": {
            name: "CreateMovieRequest",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "title",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "rating",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "double",
                            },
                        },
                    },
                    {
                        key: "review",
                        valueType: {
                            type: "id",
                            value: "type_imdb:MovieReview",
                        },
                    },
                ],
            },
        },
    },
    subpackages: {
        subpackage_imdb: {
            subpackageId: "subpackage_imdb",
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
                    id: "createMovie",
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
                                value: "type_imdb:CreateMovieRequest",
                            },
                        },
                    },
                    response: {
                        type: {
                            type: "reference",
                            value: {
                                type: "id",
                                value: "type_imdb:MovieId",
                            },
                        },
                    },
                    errorsV2: [],
                    examples: [],
                },
            ],
            webhooks: [],
            websockets: [],
            types: [
                "type_imdb:MovieId",
                "type_imdb:Movie",
                "type_imdb:DetailedMovieReview",
                "type_imdb:AgressiveMovieReview",
                "type_imdb:MovieReview",
                "type_imdb:CreateMovieRequest",
            ],
            subpackages: [],
        },
    },
    rootPackage: {
        endpoints: [],
        webhooks: [],
        websockets: [],
        types: [],
        subpackages: ["subpackage_imdb"],
    },
    globalHeaders: [],
};
