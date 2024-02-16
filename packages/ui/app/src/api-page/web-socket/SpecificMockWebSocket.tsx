import { ResolvedPubSubWebsocketDefinition } from "@fern-ui/app-utils";

export const SPECIFIC_WEBSOCKET_MOCK: ResolvedPubSubWebsocketDefinition = {
    id: "hume-websocket",
    slug: ["wss", "chat"],
    name: "Real-time Chat API",
    description: "Chat with empathic AI Assistants.",
    path: [{ type: "literal", value: "/chat" }],
    pathParameters: [],
    queryParameters: [],
    publish: {
        description: "Send messages to the WebSocket",
        shape: {
            type: "undiscriminatedUnion",
            variants: [
                {
                    displayName: "Audio Input",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "type",
                                valueShape: {
                                    type: "stringLiteral",
                                    value: "audio_input",
                                },
                            },
                            {
                                key: "data",
                                valueShape: {
                                    type: "string",
                                },
                            },
                        ],
                    },
                },
                {
                    displayName: "Text-to-Speech Input",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "type",
                                valueShape: {
                                    type: "stringLiteral",
                                    value: "tts",
                                },
                            },
                            {
                                key: "text",
                                valueShape: {
                                    type: "string",
                                },
                            },
                            {
                                key: "sample_id",
                                valueShape: {
                                    type: "integer",
                                },
                            },
                            {
                                key: "speaker",
                                valueShape: {
                                    type: "string",
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    subscribe: {
        description: "Receive messages from the WebSocket",
        shape: {
            type: "undiscriminatedUnion",
            variants: [
                {
                    displayName: "Assistant End of Stream",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "type",
                                valueShape: {
                                    type: "stringLiteral",
                                    value: "assistant_end",
                                },
                            },
                        ],
                    },
                },
                {
                    displayName: "Assistant Message",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "type",
                                valueShape: {
                                    type: "stringLiteral",
                                    value: "assistant_message",
                                },
                            },
                            {
                                key: "id",
                                valueShape: {
                                    type: "string",
                                },
                            },
                            {
                                key: "message",
                                valueShape: {
                                    type: "object",
                                    properties: () => [
                                        {
                                            key: "role",
                                            valueShape: {
                                                type: "enum",
                                                values: [
                                                    { value: "assistant" },
                                                    { value: "system" },
                                                    { value: "user" },
                                                ],
                                            },
                                        },
                                        {
                                            key: "content",
                                            valueShape: {
                                                type: "string",
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                key: "models",
                                valueShape: {
                                    type: "list",
                                    shape: {
                                        type: "object",
                                        properties: () => [
                                            {
                                                key: "model",
                                                valueShape: {
                                                    type: "string",
                                                },
                                            },
                                            {
                                                key: "entries",
                                                valueShape: {
                                                    type: "list",
                                                    shape: {
                                                        type: "object",
                                                        properties: () => [
                                                            {
                                                                key: "name",
                                                                valueShape: {
                                                                    type: "string",
                                                                },
                                                            },
                                                            {
                                                                key: "score",
                                                                valueShape: {
                                                                    type: "integer",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        ],
                    },
                },
                {
                    displayName: "Audio Output",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "type",
                                valueShape: {
                                    type: "stringLiteral",
                                    value: "audio_output",
                                },
                            },
                            {
                                key: "id",
                                valueShape: {
                                    type: "string",
                                },
                            },
                            {
                                key: "data",
                                valueShape: {
                                    type: "string",
                                },
                            },
                        ],
                    },
                },
                {
                    displayName: "Error",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "type",
                                valueShape: {
                                    type: "stringLiteral",
                                    value: "error",
                                },
                            },
                            {
                                key: "code",
                                valueShape: {
                                    type: "string",
                                },
                            },
                            {
                                key: "slug",
                                valueShape: {
                                    type: "string",
                                },
                            },
                            {
                                key: "message",
                                valueShape: {
                                    type: "string",
                                },
                            },
                        ],
                    },
                },
                {
                    displayName: "User Message",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "type",
                                valueShape: {
                                    type: "stringLiteral",
                                    value: "user_message",
                                },
                            },
                            {
                                key: "message",
                                valueShape: {
                                    type: "object",
                                    properties: () => [
                                        {
                                            key: "role",
                                            valueShape: {
                                                type: "enum",
                                                values: [
                                                    { value: "assistant" },
                                                    { value: "system" },
                                                    { value: "user" },
                                                ],
                                            },
                                        },
                                        {
                                            key: "content",
                                            valueShape: {
                                                type: "string",
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                key: "models",
                                valueShape: {
                                    type: "list",
                                    shape: {
                                        type: "object",
                                        properties: () => [
                                            {
                                                key: "model",
                                                valueShape: {
                                                    type: "string",
                                                },
                                            },
                                            {
                                                key: "entries",
                                                valueShape: {
                                                    type: "list",
                                                    shape: {
                                                        type: "object",
                                                        properties: () => [
                                                            {
                                                                key: "name",
                                                                valueShape: {
                                                                    type: "string",
                                                                },
                                                            },
                                                            {
                                                                key: "score",
                                                                valueShape: {
                                                                    type: "integer",
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                            {
                                key: "time",
                                valueShape: {
                                    type: "object",
                                    properties: () => [
                                        {
                                            key: "begin",
                                            valueShape: {
                                                type: "integer",
                                            },
                                        },
                                        {
                                            key: "end",
                                            valueShape: {
                                                type: "integer",
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    },
    examples: [
        {
            name: "Example Chat",
            description: "Example of a WebSocket connection",
            queryParameters: {},
            pathParameters: {},
            events: [
                {
                    action: "send",
                    variant: "Audio Input",
                    payload: {
                        type: "audio_input",
                        data: "/+MYxAAEaAIEeUAQAgBgNgP/////KQQ/////Lvrg+lcWYHgtjadzsbTq+yREu495tq9c6v/7vt/of7mna9v6/btUnU17Jun9/+MYxCkT26KW+YGBAj9v6vUh+zab//v/96C3/pu6H+pv//r/ycIIP4pcWWTRBBBAMXgNdbRaABQAAABRWKwgjQVX0ECmrb///+MYxBQSM0sWWYI4A++Z/////////////0rOZ3MP//7H44QEgxgdvRVMXHZseL//540B4JAvMPEgaA4/0nHjxLhRgAoAYAgA/+MYxAYIAAJfGYEQAMAJAIAQMAwX936/q/tWtv/2f/+v//6v/+7qTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
                    },
                },
                {
                    action: "recieve",
                    variant: "Audio Output",
                    payload: {
                        type: "audio_output",
                        id: "audio_snippet_id",
                        data: "/+MYxAAEaAIEeUAQAgBgNgP/////KQQ/////Lvrg+lcWYHgtjadzsbTq+yREu495tq9c6v/7vt/of7mna9v6/btUnU17Jun9/+MYxCkT26KW+YGBAj9v6vUh+zab//v/96C3/pu6H+pv//r/ycIIP4pcWWTRBBBAMXgNdbRaABQAAABRWKwgjQVX0ECmrb///+MYxBQSM0sWWYI4A++Z/////////////0rOZ3MP//7H44QEgxgdvRVMXHZseL//540B4JAvMPEgaA4/0nHjxLhRgAoAYAgA/+MYxAYIAAJfGYEQAMAJAIAQMAwX936/q/tWtv/2f/+v//6v/+7qTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
                    },
                },
                {
                    action: "recieve",
                    variant: "Audio Output",
                    payload: {
                        type: "audio_output",
                        id: "another_snippet_id",
                        data: "/+MYxAAEaAIEeUAQAgBgNgP/////KQQ/////Lvrg+lcWYHgtjadzsbTq+yREu495tq9c6v/7vt/of7mna9v6/btUnU17Jun9/+MYxCkT26KW+YGBAj9v6vUh+zab//v/96C3/pu6H+pv//r/ycIIP4pcWWTRBBBAMXgNdbRaABQAAABRWKwgjQVX0ECmrb///+MYxBQSM0sWWYI4A++Z/////////////0rOZ3MP//7H44QEgxgdvRVMXHZseL//540B4JAvMPEgaA4/0nHjxLhRgAoAYAgA/+MYxAYIAAJfGYEQAMAJAIAQMAwX936/q/tWtv/2f/+v//6v/+7qTEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV",
                    },
                },
                {
                    action: "recieve",
                    variant: "Assistant End of Stream",
                    payload: {
                        type: "assistant_end",
                    },
                },
            ],
        },
    ],
    defaultEnvironment: {
        id: "prod",
        baseUrl: "wss://api.hume.ai/v0/assistant",
    },
    environments: [
        {
            id: "prod",
            baseUrl: "wss://api.hume.ai/v0/assistant",
        },
    ],
};
