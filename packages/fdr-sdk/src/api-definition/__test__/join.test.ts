import { APIV1Read } from "../../client";
import { joiner } from "../join";
import * as Latest from "../latest";

const PRIMITIVE_SHAPE: Latest.TypeReference.Primitive = {
    type: "primitive" as const,
    value: {
        type: "string",
        regex: undefined,
        minLength: undefined,
        maxLength: undefined,
        default: undefined,
    },
};

const endpoint1: Latest.EndpointDefinition = {
    id: Latest.EndpointId("endpoint-1"),
    namespace: [],
    method: "GET",
    path: [],
    defaultEnvironment: Latest.EnvironmentId("production"),
    environments: [
        {
            id: Latest.EnvironmentId("production"),
            baseUrl: "https://example.com",
        },
    ],
    pathParameters: undefined,
    queryParameters: [
        {
            key: Latest.PropertyKey("query"),
            valueShape: {
                type: "alias",
                value: {
                    type: "id",
                    id: Latest.TypeId("type-1"),
                    default: undefined,
                },
            },
            arrayEncoding: "comma",
            description: undefined,
            availability: undefined,
        },
    ],
    requestHeaders: undefined,
    responseHeaders: undefined,
    request: undefined,
    response: undefined,
    auth: undefined,
    description: undefined,
    availability: undefined,
    errors: undefined,
    examples: undefined,
    snippetTemplates: undefined,
};

const endpoint2: Latest.EndpointDefinition = {
    id: Latest.EndpointId("endpoint-2"),
    namespace: [],
    method: "GET",
    path: [],
    defaultEnvironment: Latest.EnvironmentId("production"),
    environments: [
        {
            id: Latest.EnvironmentId("production"),
            baseUrl: "https://example.com",
        },
    ],
    pathParameters: undefined,
    queryParameters: undefined,
    requestHeaders: [
        {
            key: Latest.PropertyKey("header"),
            valueShape: {
                type: "alias",
                value: {
                    type: "id",
                    id: Latest.TypeId("type-2"),
                    default: undefined,
                },
            },
            description: undefined,
            availability: undefined,
        },
    ],
    responseHeaders: undefined,
    request: undefined,
    response: undefined,
    auth: [Latest.AuthSchemeId("auth")],
    description: undefined,
    availability: undefined,
    errors: undefined,
    examples: undefined,
    snippetTemplates: undefined,
};

const websocket1: Latest.WebSocketChannel = {
    id: Latest.WebSocketId("websocket-1"),
    namespace: [],
    path: [],
    messages: [
        {
            type: APIV1Read.WebSocketMessageId("message-1"),
            description: undefined,
            availability: undefined,
            displayName: undefined,
            origin: "client",
            body: {
                type: "alias",
                value: {
                    type: "optional",
                    default: undefined,
                    shape: {
                        type: "alias",
                        value: {
                            type: "id",
                            id: Latest.TypeId("type-3"),
                            default: undefined,
                        },
                    },
                },
            },
        },
    ],
    defaultEnvironment: Latest.EnvironmentId("production"),
    environments: [
        {
            id: Latest.EnvironmentId("production"),
            baseUrl: "https://example.com",
        },
    ],
    pathParameters: undefined,
    queryParameters: undefined,
    requestHeaders: undefined,
    auth: undefined,
    description: undefined,
    availability: undefined,
    examples: undefined,
};

const type1: Latest.TypeDefinition = {
    name: "type-1",
    description: undefined,
    availability: undefined,
    shape: {
        type: "alias",
        value: PRIMITIVE_SHAPE,
    },
};

const type2: Latest.TypeDefinition = {
    name: "type-2",
    description: undefined,
    availability: undefined,
    shape: {
        type: "alias",
        value: PRIMITIVE_SHAPE,
    },
};

const type3: Latest.TypeDefinition = {
    name: "type-3",
    description: undefined,
    availability: undefined,
    shape: {
        type: "alias",
        value: PRIMITIVE_SHAPE,
    },
};

const type4: Latest.TypeDefinition = {
    name: "type-4",
    description: undefined,
    availability: undefined,
    shape: {
        type: "alias",
        value: PRIMITIVE_SHAPE,
    },
};

const authScheme: Latest.AuthScheme = {
    type: "bearerAuth",
    tokenName: "API Token",
};

const api1: Latest.ApiDefinition = {
    id: Latest.ApiDefinitionId("api"),
    endpoints: {
        [endpoint1.id]: endpoint1,
    },
    webhooks: {},
    websockets: {},
    types: {
        [Latest.TypeId("type-1")]: type1,
        [Latest.TypeId("type-4")]: type4,
    },
    subpackages: {},
    auths: {},
    globalHeaders: [
        {
            key: Latest.PropertyKey("global"),
            valueShape: {
                type: "alias",
                value: {
                    type: "id",
                    id: Latest.TypeId("type-4"),
                    default: undefined,
                },
            },
            description: undefined,
            availability: undefined,
        },
    ],
};

const api2: Latest.ApiDefinition = {
    id: Latest.ApiDefinitionId("api"),
    endpoints: {
        [endpoint2.id]: endpoint2,
    },
    webhooks: {},
    websockets: {},
    types: {
        [Latest.TypeId("type-2")]: type2,
        [Latest.TypeId("type-4")]: type4,
    },
    subpackages: {},
    auths: {
        [Latest.AuthSchemeId("auth")]: authScheme,
    },
    globalHeaders: [
        {
            key: Latest.PropertyKey("global"),
            valueShape: {
                type: "alias",
                value: {
                    type: "id",
                    id: Latest.TypeId("type-4"),
                    default: undefined,
                },
            },
            description: undefined,
            availability: undefined,
        },
    ],
};

const api3: Latest.ApiDefinition = {
    id: Latest.ApiDefinitionId("api"),
    endpoints: {},
    webhooks: {},
    websockets: {
        [websocket1.id]: websocket1,
    },
    types: {
        [Latest.TypeId("type-3")]: type3,
        [Latest.TypeId("type-4")]: type4,
    },
    subpackages: {},
    auths: {},
    globalHeaders: [
        {
            key: Latest.PropertyKey("global"),
            valueShape: {
                type: "alias",
                value: {
                    type: "id",
                    id: Latest.TypeId("type-4"),
                    default: undefined,
                },
            },
            description: undefined,
            availability: undefined,
        },
    ],
};

describe("join", () => {
    it("should prune endpoint1 and its types", () => {
        const pruned = joiner()(api1, api2, api3);

        expect(Object.keys(pruned.endpoints)).toStrictEqual([endpoint1.id, endpoint2.id]);
        expect(Object.keys(pruned.websockets)).toStrictEqual([websocket1.id]);
        expect(new Set(Object.keys(pruned.types))).toStrictEqual(
            new Set([type1.name, type2.name, type3.name, type4.name]),
        );
        expect(Object.keys(pruned.auths)).toStrictEqual([Latest.AuthSchemeId("auth")]);
        expect(pruned.globalHeaders).toStrictEqual([
            {
                key: Latest.PropertyKey("global"),
                valueShape: {
                    type: "alias",
                    value: {
                        type: "id",
                        id: Latest.TypeId("type-4"),
                        default: undefined,
                    },
                },
                description: undefined,
                availability: undefined,
            },
        ]);
    });
});
