import { ResolvedPubSubWebsocketDefinition } from "@fern-ui/app-utils";

export const SPECIFIC_WEBSOCKET_MOCK_2: ResolvedPubSubWebsocketDefinition = {
    id: "websocket",
    slug: ["wss", "transcribe"],
    name: "Real-time API",
    description: "Real-time transcription",
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
                    { value: "pcm_s16le", description: "PCM signed 16-bit little-endian" },
                    { value: "pcm_mulaw", description: "PCM Mu-law" },
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
        description: "Send messages to the WebSocket",
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
                            {
                                key: "terminate_session",
                                valueShape: {
                                    type: "boolean",
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
                    additionalProperties: [
                        { key: "audio_start", valueShape: { type: "integer" } },
                        { key: "audio_end", valueShape: { type: "integer" } },
                        { key: "confidence", valueShape: { type: "double" } },
                        { key: "text", valueShape: { type: "string" } },
                        {
                            key: "words",
                            valueShape: {
                                type: "list",
                                shape: {
                                    type: "object",
                                    properties: () => [
                                        { key: "start", valueShape: { type: "integer" } },
                                        { key: "end", valueShape: { type: "integer" } },
                                        { key: "confidence", valueShape: { type: "double" } },
                                        { key: "text", valueShape: { type: "string" } },
                                    ],
                                },
                            },
                        },
                        { key: "created", valueShape: { type: "datetime" } },
                    ],
                },
                {
                    discriminantValue: "FinalTranscript",
                    additionalProperties: [
                        { key: "audio_start", valueShape: { type: "integer" } },
                        { key: "audio_end", valueShape: { type: "integer" } },
                        { key: "confidence", valueShape: { type: "double" } },
                        { key: "text", valueShape: { type: "string" } },
                        {
                            key: "words",
                            valueShape: {
                                type: "list",
                                shape: {
                                    type: "object",
                                    properties: () => [
                                        { key: "start", valueShape: { type: "integer" } },
                                        { key: "end", valueShape: { type: "integer" } },
                                        { key: "confidence", valueShape: { type: "double" } },
                                        { key: "text", valueShape: { type: "string" } },
                                    ],
                                },
                            },
                        },
                        { key: "created", valueShape: { type: "datetime" } },
                        { key: "punctuated", valueShape: { type: "boolean" } },
                        { key: "text_formatted", valueShape: { type: "boolean" } },
                    ],
                },
                {
                    discriminantValue: "SessionTerminated",
                    additionalProperties: [
                        { key: "audio_start", valueShape: { type: "integer" } },
                        { key: "audio_end", valueShape: { type: "integer" } },
                        { key: "confidence", valueShape: { type: "double" } },
                        { key: "text", valueShape: { type: "string" } },
                        {
                            key: "words",
                            valueShape: {
                                type: "list",
                                shape: {
                                    type: "object",
                                    properties: () => [
                                        { key: "start", valueShape: { type: "integer" } },
                                        { key: "end", valueShape: { type: "integer" } },
                                        { key: "confidence", valueShape: { type: "double" } },
                                        { key: "text", valueShape: { type: "string" } },
                                    ],
                                },
                            },
                        },
                        { key: "created", valueShape: { type: "datetime" } },
                    ],
                },
                {
                    discriminantValue: "RealtimeError",
                    additionalProperties: [{ key: "error", valueShape: { type: "string" } }],
                },
            ],
        },
    },
    examples: [
        {
            name: "Example",
            description: "Example of a realtime transcription",
            queryParameters: {
                sample_rate: 16000,
                word_boost: '["foo","bar"]',
                encoding: "pcm_s16le",
            },
            pathParameters: {},
            events: [
                {
                    action: "recieve",
                    variant: "SessionBegins",
                    payload: {
                        session_id: "f14499a6-c399-4c30-b1eb-0a33af64b1d9",
                        expires_at: "2023-11-04T16:51:38.316048",
                        message_type: "SessionBegins",
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
                    payload: {
                        message_type: "PartialTranscript",
                        created: "2023-11-03T17:14:13.854523",
                        audio_start: 5310,
                        audio_end: 7540,
                        confidence: 0.59751355353605,
                        text: "how can i show",
                        words: [
                            {
                                start: 7140,
                                end: 7175,
                                confidence: 0.466229424909777,
                                text: "how",
                            },
                            {
                                start: 7220,
                                end: 7255,
                                confidence: 0.432059008767216,
                                text: "can",
                            },
                            { start: 7300, end: 7335, confidence: 0.994432034661841, text: "i" },
                            {
                                start: 7380,
                                end: 7415,
                                confidence: 0.497333745805364,
                                text: "show",
                            },
                        ],
                    },
                },
                {
                    action: "send",
                    variant: "Send Audio",
                    payload: "Test data test data test data test data",
                },
                {
                    action: "send",
                    variant: "Send Audio",
                    payload: "Test data test data test data test data",
                },
                {
                    action: "recieve",
                    variant: "RealtimeError",
                    payload: {
                        error: "Client sent audio too fast",
                    },
                },
                {
                    action: "recieve",
                    variant: "FinalTranscript",
                    payload: {
                        message_type: "FinalTranscript",
                        created: "2023-11-03T17:14:35.00332",
                        audio_start: 5310,
                        audio_end: 25580,
                        confidence: 0.853363490052184,
                        text: "How can I show these two slides? So that demonstrates that the guide Cap, which for most of the last 3 million years has been the size of the lower 48 States, has shrunk by 40%. But this understates the seriousness of this particular problem because it doesn't show the sickness of the ice, the Oregon of the beating heart of the global climate system. It expands in winter and contracts against summer. The next slide I show you will be a rapid fast forward of what happened over the last 25 years. The permanentized is marked in red, and as you see, it expands to the dark wood. That's an annual.",
                        words: [
                            {
                                start: 7140,
                                end: 7175,
                                confidence: 0.466229424909777,
                                text: "How",
                            },
                            {
                                start: 7220,
                                end: 7255,
                                confidence: 0.432059008767216,
                                text: "can",
                            },
                            { start: 7300, end: 7335, confidence: 0.99, text: "I" },
                            {
                                start: 7380,
                                end: 7415,
                                confidence: 0.497333745805364,
                                text: "show",
                            },
                            {
                                start: 7660,
                                end: 7695,
                                confidence: 0.999622368415665,
                                text: "these",
                            },
                            { start: 7700, end: 7735, confidence: 1, text: "two" },
                            {
                                start: 7780,
                                end: 7895,
                                confidence: 0.950111441145432,
                                text: "slides?",
                            },
                            { start: 8060, end: 8095, confidence: 0.865500654768006, text: "So" },
                            {
                                start: 8100,
                                end: 8135,
                                confidence: 0.736370866587664,
                                text: "that",
                            },
                            {
                                start: 8220,
                                end: 8535,
                                confidence: 0.704626940209106,
                                text: "demonstrates",
                            },
                            {
                                start: 8580,
                                end: 8615,
                                confidence: 0.993622467290789,
                                text: "that",
                            },
                        ],
                        punctuated: true,
                        text_formatted: true,
                    },
                },
                {
                    action: "send",
                    variant: "Terminate Session",
                    payload: {
                        terminate_session: true,
                    },
                },
                {
                    action: "recieve",
                    variant: "SessionTerminated",
                    payload: {
                        message_type: "SessionTerminated",
                    },
                },
            ],
        },
    ],
    defaultEnvironment: {
        id: "API",
        baseUrl: "wss://api.assemblyai.com/v2/realtime/ws",
    },
    environments: [
        {
            id: "API",
            baseUrl: "wss://api.assemblyai.com/v2/realtime/ws",
        },
    ],
};
