import { ResolvedPubSubWebsocketDefinition } from "@fern-ui/app-utils";

export const WEBSOCKET_MOCK: ResolvedPubSubWebsocketDefinition = {
    id: "websocket",
    slug: ["wss", "example"],
    name: "Real-time API",
    description: "Example of websocket usage",
    path: [{ type: "literal", value: "/" }],
    pathParameters: [],
    queryParameters: [
        { key: "sample_rate", shape: { type: "integer" }, description: "The sample rate of the streamed audio" },
        {
            key: "word_boost",
            shape: { type: "string" },
            description:
                "Add up to 2500 characters of custom vocabulary.\nThe parameter value must be a JSON encoded array of strings.",
        },
        {
            key: "encoding",
            shape: {
                type: "enum",
                values: [
                    { value: "format_1", description: "Encode data as format_1" },
                    { value: "format_2", description: "Encode data as format_2" },
                ],
            },
            description: "The encoding of the audio data",
        },
        {
            key: "token",
            shape: { type: "string" },
            description:
                "Authenticate using a [generated temporary token](https://www.assemblyai.com/docs/guides/real-time-streaming-transcription#creating-temporary-authentication-tokens)",
        },
    ],
    publish: {
        description: "Send audio data to the server",
        shape: {
            type: "undiscriminatedUnion",
            variants: [
                {
                    displayName: "Send Audio",
                    shape: {
                        type: "string",
                    },
                },
                {
                    displayName: "Terminate Session",
                    shape: {
                        type: "object",
                        properties: () => [
                            {
                                key: "message_type",
                                valueShape: {
                                    type: "enum",
                                    values: [
                                        { value: "SessionBegins" },
                                        { value: "PartialTranscript" },
                                        { value: "FinalTranscript" },
                                        { value: "SessionTerminated" },
                                    ],
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
            type: "discriminatedUnion",
            discriminant: "message_type",
            variants: [
                {
                    discriminantValue: "SessionBegins",
                    additionalProperties: [
                        { key: "session_id", valueShape: { type: "uuid" } },
                        { key: "expires_at", valueShape: { type: "datetime" } },
                    ],
                },
                {
                    discriminantValue: "PartialTranscript",
                    additionalProperties: [],
                },
                {
                    discriminantValue: "FinalTranscript",
                    additionalProperties: [],
                },
                {
                    discriminantValue: "SessionTerminated",
                    additionalProperties: [],
                },
                {
                    discriminantValue: "RealtimeError",
                    additionalProperties: [],
                },
            ],
        },
    },
    examples: [
        {
            name: "Example",
            description: "Example of a WebSocket connection",
            queryParameters: {
                sample_rate: 16000,
                word_boost: "[]",
                encoding: "format_1",
            },
            pathParameters: {},
            events: [
                {
                    action: "recieve",
                    variant: "SessionBegins",
                    payload: {
                        session_id: "Test data test data test data test data",
                        expires_at: "2022-12-31T23:59:59Z",
                    },
                },
                {
                    action: "send",
                    variant: "Send Audio",
                    payload: "Test data test data test data test data",
                },
                {
                    action: "recieve",
                    variant: "PartialTranscript",
                    payload: "Hello, World!",
                },
                {
                    action: "recieve",
                    variant: "FinalTranscript",
                    payload: "Hello, World!",
                },
                {
                    action: "send",
                    variant: "Terminate Session",
                    payload: {
                        message_type: "SessionTerminated",
                    },
                },
            ],
        },
    ],
    defaultEnvironment: {
        id: "test",
        baseUrl: "wss://test.buildwithfern.com/v2/realtime/ws",
    },
    environments: [
        {
            id: "test",
            baseUrl: "wss://test.buildwithfern.com/v2/realtime/ws",
        },
    ],
};
