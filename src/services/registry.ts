import { PrismaClient } from "@prisma/client";
import { FernRegistry } from "../generated";
import { RegistryService } from "../generated/api/resources/registry/service/RegistryService";

export function getRegistryService(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _prisma: PrismaClient
): RegistryService {
    return new RegistryService({
        getAllApis: () => {
            return {
                apis: [
                    {
                        id: "api1",
                        name: "Authentication Service",
                        deployments: {
                            staging: {
                                registrationTime: new Date(2023, 1, 20),
                            },
                            production: {
                                registrationTime: new Date(2023, 1, 19),
                            },
                        },
                    },
                ],
            };
        },
        getApiMetadata: (request) => {
            if (request.params.apiId !== "api1") {
                throw new FernRegistry.ApiDoesNotExistError();
            }
            return {
                id: "api1",
                name: "Authentication Service",
                deployments: {
                    staging: {
                        registrationTime: new Date(2023, 1, 20),
                    },
                    production: {
                        registrationTime: new Date(2023, 1, 19),
                    },
                },
            };
        },
        getApiForEnvironment: (request) => {
            if (request.params.apiId !== "api1") {
                throw new FernRegistry.ApiDoesNotExistError();
            }
            if (request.params.environment !== "production" && request.params.environment !== "staging") {
                throw new FernRegistry.EnvironmentDoesNotExistError();
            }

            return {
                types: {
                    "type-1": {
                        name: "type 1",
                        shape: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                        examples: [],
                    },
                    "type-2": {
                        name: "type 2",
                        shape: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                        examples: [],
                    },
                    "type-3": {
                        name: "type-3",
                        shape: FernRegistry.Type.object({
                            extends: [],
                            properties: [
                                {
                                    key: "foo",
                                    valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                },
                                {
                                    key: "bar",
                                    valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                },
                                {
                                    key: "bar2",
                                    valueType: FernRegistry.Type.map({
                                        keyType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        valueType: FernRegistry.Type.reference("type-2"),
                                    }),
                                },
                                {
                                    key: "test",
                                    valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                },
                                {
                                    key: "test",
                                    valueType: FernRegistry.Type.optional({
                                        itemType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    }),
                                },
                                {
                                    key: "test",
                                    valueType: FernRegistry.Type.map({
                                        keyType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        valueType: FernRegistry.Type.list({
                                            itemType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                    {
                                                        key: "bar",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                    {
                                                        key: "baz",
                                                        valueType: FernRegistry.Type.list({
                                                            itemType: FernRegistry.Type.primitive(
                                                                FernRegistry.PrimitiveType.string()
                                                            ),
                                                        }),
                                                    },
                                                ],
                                            }),
                                        }),
                                    }),
                                },
                                {
                                    key: "baz",
                                    valueType: FernRegistry.Type.optional({
                                        itemType: FernRegistry.Type.list({
                                            itemType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                    {
                                                        key: "bar",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                    {
                                                        key: "baz",
                                                        valueType: FernRegistry.Type.list({
                                                            itemType: FernRegistry.Type.primitive(
                                                                FernRegistry.PrimitiveType.string()
                                                            ),
                                                        }),
                                                    },
                                                ],
                                            }),
                                        }),
                                    }),
                                },
                            ],
                        }),
                        examples: [],
                    },
                },
                subpackages: {
                    a: {
                        name: "a",
                        types: ["type-1", "type-2"],
                        endpoints: [
                            {
                                id: "endpoint-1",
                                name: "My Endpoint",
                                docs: "Retrieves the current account balance, based on the authentication that was used to make the request. For a sample request, see this other page",
                                headers: [
                                    {
                                        key: "X-API-Key",
                                        type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                    {
                                        key: "My-Other-Header",
                                        type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                ],
                                queryParameters: [
                                    {
                                        key: "queryParam1",
                                        type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                    {
                                        key: "queryParam2",
                                        type: FernRegistry.Type.optional({
                                            itemType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        }),
                                    },
                                    {
                                        key: "queryParam3",
                                        type: FernRegistry.Type.reference("type-1"),
                                    },
                                ],
                                path: {
                                    parts: [
                                        FernRegistry.EndpointPathPart.literal("/"),
                                        FernRegistry.EndpointPathPart.pathParameter("test"),
                                    ],
                                    pathParameters: [
                                        {
                                            key: "test",
                                            type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.integer()),
                                        },
                                    ],
                                },
                                request: FernRegistry.Type.object({
                                    extends: [],
                                    properties: [
                                        {
                                            key: "foo",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "bar",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "bar2",
                                            valueType: FernRegistry.Type.map({
                                                keyType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                                valueType: FernRegistry.Type.reference("type-2"),
                                            }),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.optional({
                                                itemType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                            }),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.map({
                                                keyType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                                valueType: FernRegistry.Type.list({
                                                    itemType: FernRegistry.Type.object({
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "foo",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "bar",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "baz",
                                                                valueType: FernRegistry.Type.list({
                                                                    itemType: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                }),
                                            }),
                                        },
                                        {
                                            key: "baz",
                                            valueType: FernRegistry.Type.optional({
                                                itemType: FernRegistry.Type.list({
                                                    itemType: FernRegistry.Type.object({
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "foo",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "bar",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "baz",
                                                                valueType: FernRegistry.Type.list({
                                                                    itemType: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                }),
                                            }),
                                        },
                                    ],
                                }),
                                response: FernRegistry.Type.object({
                                    extends: [],
                                    properties: [
                                        {
                                            key: "foo",
                                            valueType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                ],
                                            }),
                                        },
                                        {
                                            key: "bar",
                                            valueType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                    {
                                                        key: "bar",
                                                        valueType: FernRegistry.Type.union({
                                                            members: [
                                                                {
                                                                    type: FernRegistry.Type.enum({
                                                                        values: [
                                                                            { value: "abc" },
                                                                            { value: "def" },
                                                                            { value: "ghi" },
                                                                            { value: "jkl" },
                                                                        ],
                                                                    }),
                                                                },
                                                                {
                                                                    type: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                },
                                                                {
                                                                    type: FernRegistry.Type.object({
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "foo",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.string()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    }),
                                                                },
                                                            ],
                                                        }),
                                                    },
                                                    {
                                                        key: "baz",
                                                        valueType: FernRegistry.Type.discriminatedUnion({
                                                            discriminant: "type",
                                                            members: [
                                                                {
                                                                    discriminantValue: "dog",
                                                                    additionalProperties: {
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "favoriteBrandOfDogFood",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.string()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                                {
                                                                    discriminantValue: "cat",
                                                                    additionalProperties: {
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "meows",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.boolean()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            ],
                                                        }),
                                                    },
                                                ],
                                            }),
                                        },
                                    ],
                                }),
                                examples: [
                                    {
                                        url: "/12345?queryParam1=foo",
                                        pathParameters: {
                                            test: 12345,
                                        },
                                        queryParameters: {
                                            queryParam1: "foo",
                                        },
                                        headers: {
                                            "X-API-Key": "my-api-keydaskldjakld",
                                            "My-Other-Header": "dslajkdlksajdklajdk",
                                        },
                                        requestBody: {
                                            key1: 12346,
                                            key2: ["a", "dklsad", "ASdads"],
                                            key3: 12346,
                                            key4: {
                                                nested: {
                                                    object: "HELLO",
                                                },
                                            },
                                            key5: true,
                                        },
                                        responseBody: {
                                            key1: 12346,
                                            key2: ["a", "dklsad", "ASdads"],
                                            key3: 12346,
                                            key4: {
                                                nested: {
                                                    object: "HELLO",
                                                },
                                            },
                                            key5: true,
                                        },
                                        responseStatusCode: 200,
                                    },
                                    {
                                        url: "/10000?queryParam1=bar",
                                        pathParameters: {
                                            test: 10000,
                                        },
                                        queryParameters: {
                                            queryParam1: "bar",
                                        },
                                        headers: {
                                            "X-API-Key": "my-api-saldjaldk",
                                            "My-Other-Header": "dkasldjaslkd",
                                        },
                                        requestBody: {
                                            key1: 14312,
                                            key2: ["a", "dklsad", "ASdads"],
                                            key3: 143213,
                                            key5: false,
                                        },
                                        responseBody: {
                                            key1: 4433,
                                            key2: ["a", "dklsad", "ASdads"],
                                            key3: 12313,
                                            key4: {
                                                hello: [],
                                            },
                                        },
                                        responseStatusCode: 200,
                                    },
                                ],
                            },
                        ],
                        subpackages: ["b"],
                    },
                    b: {
                        name: "b-name",
                        types: [],
                        endpoints: [
                            {
                                id: "endpoint-1",
                                name: "My Endpoint",
                                docs: "Retrieves the current account balance, based on the authentication that was used to make the request. For a sample request, see this other page",
                                headers: [],
                                queryParameters: [
                                    {
                                        key: "queryParam1",
                                        type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                    {
                                        key: "queryParam2",
                                        type: FernRegistry.Type.optional({
                                            itemType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        }),
                                    },
                                ],
                                path: {
                                    parts: [
                                        FernRegistry.EndpointPathPart.literal("/"),
                                        FernRegistry.EndpointPathPart.pathParameter("test"),
                                    ],
                                    pathParameters: [
                                        {
                                            key: "test",
                                            type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.integer()),
                                        },
                                    ],
                                },
                                request: FernRegistry.Type.object({
                                    extends: [],
                                    properties: [
                                        {
                                            key: "foo",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "bar",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.optional({
                                                itemType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                            }),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.map({
                                                keyType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                                valueType: FernRegistry.Type.list({
                                                    itemType: FernRegistry.Type.object({
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "foo",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "bar",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "baz",
                                                                valueType: FernRegistry.Type.list({
                                                                    itemType: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                }),
                                            }),
                                        },
                                        {
                                            key: "baz",
                                            valueType: FernRegistry.Type.optional({
                                                itemType: FernRegistry.Type.list({
                                                    itemType: FernRegistry.Type.object({
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "foo",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "bar",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "baz",
                                                                valueType: FernRegistry.Type.list({
                                                                    itemType: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                }),
                                            }),
                                        },
                                    ],
                                }),
                                response: FernRegistry.Type.object({
                                    extends: [],
                                    properties: [
                                        {
                                            key: "foo",
                                            valueType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                ],
                                            }),
                                        },
                                        {
                                            key: "bar",
                                            valueType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                    {
                                                        key: "bar",
                                                        valueType: FernRegistry.Type.union({
                                                            members: [
                                                                {
                                                                    type: FernRegistry.Type.enum({
                                                                        values: [
                                                                            { value: "abc" },
                                                                            { value: "def" },
                                                                            { value: "ghi" },
                                                                            { value: "jkl" },
                                                                        ],
                                                                    }),
                                                                },
                                                                {
                                                                    type: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                },
                                                                {
                                                                    type: FernRegistry.Type.object({
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "foo",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.string()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    }),
                                                                },
                                                            ],
                                                        }),
                                                    },
                                                    {
                                                        key: "baz",
                                                        valueType: FernRegistry.Type.discriminatedUnion({
                                                            discriminant: "type",
                                                            members: [
                                                                {
                                                                    discriminantValue: "dog",
                                                                    additionalProperties: {
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "favoriteBrandOfDogFood",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.string()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                                {
                                                                    discriminantValue: "cat",
                                                                    additionalProperties: {
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "meows",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.boolean()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            ],
                                                        }),
                                                    },
                                                ],
                                            }),
                                        },
                                    ],
                                }),
                                examples: [],
                            },
                            {
                                id: "endpoint-2",
                                name: "My Endpoint",
                                docs: "Retrieves the current account balance, based on the authentication that was used to make the request. For a sample request, see this other page",
                                headers: [],
                                queryParameters: [
                                    {
                                        key: "queryParam1",
                                        type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                    {
                                        key: "queryParam2",
                                        type: FernRegistry.Type.optional({
                                            itemType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        }),
                                    },
                                ],
                                path: {
                                    parts: [
                                        FernRegistry.EndpointPathPart.literal("/"),
                                        FernRegistry.EndpointPathPart.pathParameter("test"),
                                    ],
                                    pathParameters: [
                                        {
                                            key: "test",
                                            type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.integer()),
                                        },
                                    ],
                                },
                                request: FernRegistry.Type.object({
                                    extends: [],
                                    properties: [
                                        {
                                            key: "foo",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "bar",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.optional({
                                                itemType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                            }),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.map({
                                                keyType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                                valueType: FernRegistry.Type.list({
                                                    itemType: FernRegistry.Type.object({
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "foo",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "bar",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "baz",
                                                                valueType: FernRegistry.Type.list({
                                                                    itemType: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                }),
                                            }),
                                        },
                                        {
                                            key: "baz",
                                            valueType: FernRegistry.Type.optional({
                                                itemType: FernRegistry.Type.list({
                                                    itemType: FernRegistry.Type.object({
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "foo",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "bar",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "baz",
                                                                valueType: FernRegistry.Type.list({
                                                                    itemType: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                }),
                                            }),
                                        },
                                    ],
                                }),
                                response: FernRegistry.Type.object({
                                    extends: [],
                                    properties: [
                                        {
                                            key: "foo",
                                            valueType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                ],
                                            }),
                                        },
                                        {
                                            key: "bar",
                                            valueType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                    {
                                                        key: "bar",
                                                        valueType: FernRegistry.Type.union({
                                                            members: [
                                                                {
                                                                    type: FernRegistry.Type.enum({
                                                                        values: [
                                                                            { value: "abc" },
                                                                            { value: "def" },
                                                                            { value: "ghi" },
                                                                            { value: "jkl" },
                                                                        ],
                                                                    }),
                                                                },
                                                                {
                                                                    type: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                },
                                                                {
                                                                    type: FernRegistry.Type.object({
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "foo",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.string()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    }),
                                                                },
                                                            ],
                                                        }),
                                                    },
                                                    {
                                                        key: "baz",
                                                        valueType: FernRegistry.Type.discriminatedUnion({
                                                            discriminant: "type",
                                                            members: [
                                                                {
                                                                    discriminantValue: "dog",
                                                                    additionalProperties: {
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "favoriteBrandOfDogFood",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.string()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                                {
                                                                    discriminantValue: "cat",
                                                                    additionalProperties: {
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "meows",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.boolean()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            ],
                                                        }),
                                                    },
                                                ],
                                            }),
                                        },
                                    ],
                                }),
                                examples: [],
                            },
                        ],
                        subpackages: ["c"],
                    },
                    c: {
                        name: "c",
                        types: [],
                        endpoints: [
                            {
                                id: "endpoint-1",
                                name: "My Endpoint",
                                docs: "Retrieves the current account balance, based on the authentication that was used to make the request. For a sample request, see this other page",
                                headers: [],
                                queryParameters: [
                                    {
                                        key: "queryParam1",
                                        type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                    {
                                        key: "queryParam2",
                                        type: FernRegistry.Type.optional({
                                            itemType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        }),
                                    },
                                ],
                                path: {
                                    parts: [
                                        FernRegistry.EndpointPathPart.literal("/"),
                                        FernRegistry.EndpointPathPart.pathParameter("test"),
                                    ],
                                    pathParameters: [
                                        {
                                            key: "test",
                                            type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.integer()),
                                        },
                                    ],
                                },
                                request: FernRegistry.Type.object({
                                    extends: [],
                                    properties: [
                                        {
                                            key: "foo",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "bar",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.optional({
                                                itemType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                            }),
                                        },
                                        {
                                            key: "test",
                                            valueType: FernRegistry.Type.map({
                                                keyType: FernRegistry.Type.primitive(
                                                    FernRegistry.PrimitiveType.string()
                                                ),
                                                valueType: FernRegistry.Type.list({
                                                    itemType: FernRegistry.Type.object({
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "foo",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "bar",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "baz",
                                                                valueType: FernRegistry.Type.list({
                                                                    itemType: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                }),
                                            }),
                                        },
                                        {
                                            key: "baz",
                                            valueType: FernRegistry.Type.optional({
                                                itemType: FernRegistry.Type.list({
                                                    itemType: FernRegistry.Type.object({
                                                        extends: [],
                                                        properties: [
                                                            {
                                                                key: "foo",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "bar",
                                                                valueType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                key: "baz",
                                                                valueType: FernRegistry.Type.list({
                                                                    itemType: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                }),
                                            }),
                                        },
                                    ],
                                }),
                                response: FernRegistry.Type.object({
                                    extends: [],
                                    properties: [
                                        {
                                            key: "foo",
                                            valueType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                ],
                                            }),
                                        },
                                        {
                                            key: "bar",
                                            valueType: FernRegistry.Type.object({
                                                extends: [],
                                                properties: [
                                                    {
                                                        key: "foo",
                                                        valueType: FernRegistry.Type.primitive(
                                                            FernRegistry.PrimitiveType.string()
                                                        ),
                                                    },
                                                    {
                                                        key: "bar",
                                                        valueType: FernRegistry.Type.union({
                                                            members: [
                                                                {
                                                                    type: FernRegistry.Type.enum({
                                                                        values: [
                                                                            { value: "abc" },
                                                                            { value: "def" },
                                                                            { value: "ghi" },
                                                                            { value: "jkl" },
                                                                        ],
                                                                    }),
                                                                },
                                                                {
                                                                    type: FernRegistry.Type.primitive(
                                                                        FernRegistry.PrimitiveType.string()
                                                                    ),
                                                                },
                                                                {
                                                                    type: FernRegistry.Type.object({
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "foo",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.string()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    }),
                                                                },
                                                            ],
                                                        }),
                                                    },
                                                    {
                                                        key: "baz",
                                                        valueType: FernRegistry.Type.discriminatedUnion({
                                                            discriminant: "type",
                                                            members: [
                                                                {
                                                                    discriminantValue: "dog",
                                                                    additionalProperties: {
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "favoriteBrandOfDogFood",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.string()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                                {
                                                                    discriminantValue: "cat",
                                                                    additionalProperties: {
                                                                        extends: [],
                                                                        properties: [
                                                                            {
                                                                                key: "meows",
                                                                                valueType: FernRegistry.Type.primitive(
                                                                                    FernRegistry.PrimitiveType.boolean()
                                                                                ),
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            ],
                                                        }),
                                                    },
                                                ],
                                            }),
                                        },
                                    ],
                                }),
                                examples: [],
                            },
                        ],
                        subpackages: [],
                    },
                },
                rootPackage: {
                    types: ["type-3"],
                    subpackages: ["a"],
                    endpoints: [
                        {
                            id: "endpoint-1",
                            name: `My ${request.params.environment} Endpoint`,
                            docs: "Retrieves the current account balance, based on the authentication that was used to make the request. For a sample request, see this other page",
                            headers: [],
                            queryParameters: [
                                {
                                    key: "queryParam1",
                                    type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                },
                                {
                                    key: "queryParam2",
                                    type: FernRegistry.Type.optional({
                                        itemType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    }),
                                },
                            ],
                            path: {
                                parts: [
                                    FernRegistry.EndpointPathPart.literal("/"),
                                    FernRegistry.EndpointPathPart.pathParameter("test"),
                                ],
                                pathParameters: [
                                    {
                                        key: "test",
                                        type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.integer()),
                                    },
                                ],
                            },
                            request: FernRegistry.Type.object({
                                extends: [],
                                properties: [
                                    {
                                        key: "foo",
                                        valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                    {
                                        key: "bar",
                                        valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                    {
                                        key: "test",
                                        valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                    {
                                        key: "test",
                                        valueType: FernRegistry.Type.optional({
                                            itemType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                        }),
                                    },
                                    {
                                        key: "test",
                                        valueType: FernRegistry.Type.map({
                                            keyType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                            valueType: FernRegistry.Type.list({
                                                itemType: FernRegistry.Type.object({
                                                    extends: [],
                                                    properties: [
                                                        {
                                                            key: "foo",
                                                            valueType: FernRegistry.Type.primitive(
                                                                FernRegistry.PrimitiveType.string()
                                                            ),
                                                        },
                                                        {
                                                            key: "bar",
                                                            valueType: FernRegistry.Type.primitive(
                                                                FernRegistry.PrimitiveType.string()
                                                            ),
                                                        },
                                                        {
                                                            key: "baz",
                                                            valueType: FernRegistry.Type.list({
                                                                itemType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            }),
                                                        },
                                                    ],
                                                }),
                                            }),
                                        }),
                                    },
                                    {
                                        key: "baz",
                                        valueType: FernRegistry.Type.optional({
                                            itemType: FernRegistry.Type.list({
                                                itemType: FernRegistry.Type.object({
                                                    extends: [],
                                                    properties: [
                                                        {
                                                            key: "foo",
                                                            valueType: FernRegistry.Type.primitive(
                                                                FernRegistry.PrimitiveType.string()
                                                            ),
                                                        },
                                                        {
                                                            key: "bar",
                                                            valueType: FernRegistry.Type.primitive(
                                                                FernRegistry.PrimitiveType.string()
                                                            ),
                                                        },
                                                        {
                                                            key: "baz",
                                                            valueType: FernRegistry.Type.list({
                                                                itemType: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            }),
                                                        },
                                                    ],
                                                }),
                                            }),
                                        }),
                                    },
                                ],
                            }),
                            response: FernRegistry.Type.object({
                                extends: [],
                                properties: [
                                    {
                                        key: "foo",
                                        valueType: FernRegistry.Type.object({
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "foo",
                                                    valueType: FernRegistry.Type.primitive(
                                                        FernRegistry.PrimitiveType.string()
                                                    ),
                                                },
                                            ],
                                        }),
                                    },
                                    {
                                        key: "bar",
                                        valueType: FernRegistry.Type.object({
                                            extends: [],
                                            properties: [
                                                {
                                                    key: "foo",
                                                    valueType: FernRegistry.Type.primitive(
                                                        FernRegistry.PrimitiveType.string()
                                                    ),
                                                },
                                                {
                                                    key: "bar",
                                                    valueType: FernRegistry.Type.union({
                                                        members: [
                                                            {
                                                                type: FernRegistry.Type.enum({
                                                                    values: [
                                                                        { value: "abc" },
                                                                        { value: "def" },
                                                                        { value: "ghi" },
                                                                        { value: "jkl" },
                                                                    ],
                                                                }),
                                                            },
                                                            {
                                                                type: FernRegistry.Type.primitive(
                                                                    FernRegistry.PrimitiveType.string()
                                                                ),
                                                            },
                                                            {
                                                                type: FernRegistry.Type.object({
                                                                    extends: [],
                                                                    properties: [
                                                                        {
                                                                            key: "foo",
                                                                            valueType: FernRegistry.Type.primitive(
                                                                                FernRegistry.PrimitiveType.string()
                                                                            ),
                                                                        },
                                                                    ],
                                                                }),
                                                            },
                                                        ],
                                                    }),
                                                },
                                                {
                                                    key: "baz",
                                                    valueType: FernRegistry.Type.discriminatedUnion({
                                                        discriminant: "type",
                                                        members: [
                                                            {
                                                                discriminantValue: "dog",
                                                                additionalProperties: {
                                                                    extends: [],
                                                                    properties: [
                                                                        {
                                                                            key: "favoriteBrandOfDogFood",
                                                                            valueType: FernRegistry.Type.primitive(
                                                                                FernRegistry.PrimitiveType.string()
                                                                            ),
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            {
                                                                discriminantValue: "cat",
                                                                additionalProperties: {
                                                                    extends: [],
                                                                    properties: [
                                                                        {
                                                                            key: "meows",
                                                                            valueType: FernRegistry.Type.primitive(
                                                                                FernRegistry.PrimitiveType.boolean()
                                                                            ),
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                        ],
                                                    }),
                                                },
                                            ],
                                        }),
                                    },
                                ],
                            }),
                            examples: [],
                        },
                        {
                            id: "endpoint-2",
                            name: "My Endpoint",
                            headers: [],
                            queryParameters: [],
                            path: {
                                parts: [FernRegistry.EndpointPathPart.literal("/")],
                                pathParameters: [],
                            },
                            request: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                            response: FernRegistry.Type.object({
                                extends: [],
                                properties: [
                                    {
                                        key: "foo",
                                        valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                ],
                            }),
                            examples: [],
                        },
                        {
                            id: "endpoint-3",
                            headers: [],
                            queryParameters: [],
                            path: {
                                parts: [
                                    FernRegistry.EndpointPathPart.literal("/hello/"),
                                    FernRegistry.EndpointPathPart.pathParameter("myPathParam"),
                                ],
                                pathParameters: [
                                    {
                                        key: "myPathParam",
                                        type: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                ],
                            },
                            request: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                            response: FernRegistry.Type.object({
                                extends: [],
                                properties: [
                                    {
                                        key: "foo",
                                        valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                                    },
                                ],
                            }),
                            examples: [],
                        },
                    ],
                },
            };
        },
    });
}
