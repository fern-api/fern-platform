import { APIV1Read } from "@fern-api/fdr-sdk";

export const REKA: APIV1Read.ApiDefinition = {
    id: "80668723-b9a5-4f3f-a85e-81f53f3243d5",
    rootPackage: {
        endpoints: [],
        subpackages: ["subpackage_chat", "subpackage_models"],
        types: [
            "type_:ChatMessageInputContentItem",
            "type_:Content",
            "type_:ChatMessage",
            "type_:ChatMessageOutputContentItem",
            "type_:ChatMessageChunkContentItem",
            "type_:ChatMessageChunk",
            "type_:ChatResponse",
            "type_:ChatRole",
            "type_:ChunkChatResponse",
            "type_:ChunkMessageResponse",
            "type_:FinishReason",
            "type_:HTTPValidationError",
            "type_:MediaType",
            "type_:MessageResponse",
            "type_:Model",
            "type_:TypedMediaContent",
            "type_:TypedText",
            "type_:Usage",
            "type_:ValidationErrorLocItem",
            "type_:ValidationError",
        ],
        webhooks: [],
        websockets: [],
    },
    types: {
        "type_chat:ChatCreateResponse": {
            name: "ChatCreateResponse",
            shape: {
                type: "undiscriminatedUnion",
                variants: [
                    {
                        type: {
                            type: "id",
                            value: "type_:ChatResponse",
                        },
                        displayName: "Chat Response",
                    },
                    {
                        type: {
                            type: "id",
                            value: "type_:ChunkChatResponse",
                        },
                        displayName: "Chunk Chat Response",
                    },
                ],
            },
        },
        "type_:ChatMessageInputContentItem": {
            name: "ChatMessageInputContentItem",
            shape: {
                type: "undiscriminatedUnion",
                variants: [
                    {
                        type: {
                            type: "id",
                            value: "type_:TypedText",
                        },
                        displayName: "Typed Text",
                    },
                    {
                        type: {
                            type: "id",
                            value: "type_:TypedMediaContent",
                        },
                        displayName: "Typed Media Content",
                    },
                ],
            },
        },
        "type_:Content": {
            name: "Content",
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
                            type: "list",
                            itemType: {
                                type: "id",
                                value: "type_:ChatMessageChunkContentItem",
                            },
                        },
                    },
                ],
            },
        },
        "type_:ChatMessage": {
            description: "A collection of pieces of content from a single entity (role).",
            name: "ChatMessage",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "content",
                        valueType: {
                            type: "id",
                            value: "type_:Content",
                        },
                    },
                    {
                        key: "role",
                        valueType: {
                            type: "id",
                            value: "type_:ChatRole",
                        },
                    },
                ],
            },
        },
        "type_:ChatMessageOutputContentItem": {
            name: "ChatMessageOutputContentItem",
            shape: {
                type: "undiscriminatedUnion",
                variants: [
                    {
                        type: {
                            type: "id",
                            value: "type_:TypedText",
                        },
                        displayName: "Typed Text",
                    },
                    {
                        type: {
                            type: "id",
                            value: "type_:TypedMediaContent",
                        },
                        displayName: "Typed Media Content",
                    },
                ],
            },
        },
        "type_:ChatMessageChunkContentItem": {
            name: "ChatMessageChunkContentItem",
            shape: {
                type: "undiscriminatedUnion",
                variants: [
                    {
                        type: {
                            type: "id",
                            value: "type_:TypedText",
                        },
                        displayName: "Typed Text",
                    },
                    {
                        type: {
                            type: "id",
                            value: "type_:TypedMediaContent",
                        },
                        displayName: "Typed Media Content",
                    },
                ],
            },
        },
        "type_:ChatMessageChunk": {
            description:
                "Type that represents a collection of turns from a single\nentity (role). This is the streaming version.",
            name: "ChatMessageChunk",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "content",
                        valueType: {
                            type: "id",
                            value: "type_:Content",
                        },
                    },
                    {
                        key: "role",
                        valueType: {
                            type: "id",
                            value: "type_:ChatRole",
                        },
                    },
                ],
            },
        },
        "type_:ChatResponse": {
            description: "A chat response.",
            name: "ChatResponse",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "id",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "model",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "responses",
                        valueType: {
                            type: "list",
                            itemType: {
                                type: "id",
                                value: "type_:MessageResponse",
                            },
                        },
                    },
                    {
                        key: "usage",
                        valueType: {
                            type: "id",
                            value: "type_:Usage",
                        },
                    },
                ],
            },
        },
        "type_:ChatRole": {
            description: "What is the role of the particular turn. Supports turns from a person and\nthe model for now",
            name: "ChatRole",
            shape: {
                type: "enum",
                values: [
                    {
                        value: "user",
                    },
                    {
                        value: "assistant",
                    },
                ],
            },
        },
        "type_:ChunkChatResponse": {
            description: "Streaming specialisation of a chat response.",
            name: "ChunkChatResponse",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "id",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "model",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "responses",
                        valueType: {
                            type: "list",
                            itemType: {
                                type: "id",
                                value: "type_:ChunkMessageResponse",
                            },
                        },
                    },
                    {
                        key: "usage",
                        valueType: {
                            type: "id",
                            value: "type_:Usage",
                        },
                    },
                ],
            },
        },
        "type_:ChunkMessageResponse": {
            description: "Streaming response message type",
            name: "ChunkMessageResponse",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "chunk",
                        valueType: {
                            type: "id",
                            value: "type_:ChatMessageChunk",
                        },
                    },
                    {
                        key: "finish_reason",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_:FinishReason",
                            },
                        },
                    },
                ],
            },
        },
        "type_:FinishReason": {
            description:
                "Enumeration which represents a reason of why the model stopped\ngenerating.\n\n- `stop` means the model generated a stop token\n\n- `length` means the model reached max_tokens number of tokens\n\n- `context` means the model reached its maximum context length",
            name: "FinishReason",
            shape: {
                type: "enum",
                values: [
                    {
                        value: "stop",
                    },
                    {
                        value: "length",
                    },
                    {
                        value: "context",
                    },
                ],
            },
        },
        "type_:HTTPValidationError": {
            name: "HTTPValidationError",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "detail",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "list",
                                itemType: {
                                    type: "id",
                                    value: "type_:ValidationError",
                                },
                            },
                        },
                    },
                ],
            },
        },
        "type_:MediaType": {
            description: "The type of media.",
            name: "MediaType",
            shape: {
                type: "enum",
                values: [
                    {
                        value: "image_url",
                    },
                    {
                        value: "video_url",
                    },
                    {
                        value: "audio_url",
                    },
                    {
                        value: "pdf_url",
                    },
                ],
            },
        },
        "type_:MessageResponse": {
            description: "Non-streaming response message type",
            name: "MessageResponse",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "finish_reason",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "id",
                                value: "type_:FinishReason",
                            },
                        },
                    },
                    {
                        key: "message",
                        valueType: {
                            type: "id",
                            value: "type_:ChatMessage",
                        },
                    },
                ],
            },
        },
        "type_:Model": {
            description:
                "Represents a model entry. A list of these is the response\n\nfrom the list models endpoints. Different users might have\n\npermissions to access different models.'",
            name: "Model",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "id",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                ],
            },
        },
        "type_:TypedMediaContent": {
            description:
                'In conjunction with MediaType this is used to enforce the\n{"type": "image_url", "image_url":"https://..."} spec.\n\nInvariant: exactly the `type` url is not None',
            name: "TypedMediaContent",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "audio_url",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                    {
                        key: "image_url",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                    {
                        key: "pdf_url",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                    {
                        key: "type",
                        valueType: {
                            type: "id",
                            value: "type_:MediaType",
                        },
                    },
                    {
                        key: "video_url",
                        valueType: {
                            type: "optional",
                            itemType: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                ],
            },
        },
        "type_:TypedText": {
            description:
                'Another way to specify a text message when you are sending multimodal input.\nYour content might look something like that:\n\n[\n{"type": "text", "text":"What is the image?"},\n{"type": "image_url", "image_url":"https://..."},\n{"type": "text", "text":"Ignore the image and just write a Python script"}\n]',
            name: "TypedText",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "text",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "type",
                        valueType: {
                            type: "unknown",
                        },
                    },
                ],
            },
        },
        "type_:Usage": {
            description: "Type representing usage metadata for a given request.",
            name: "Usage",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "input_tokens",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "integer",
                            },
                        },
                    },
                    {
                        key: "output_tokens",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "integer",
                            },
                        },
                    },
                ],
            },
        },
        "type_:ValidationErrorLocItem": {
            name: "ValidationErrorLocItem",
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
                                type: "integer",
                            },
                        },
                    },
                ],
            },
        },
        "type_:ValidationError": {
            name: "ValidationError",
            shape: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "loc",
                        valueType: {
                            type: "list",
                            itemType: {
                                type: "id",
                                value: "type_:ValidationErrorLocItem",
                            },
                        },
                    },
                    {
                        key: "msg",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                    {
                        key: "type",
                        valueType: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                ],
            },
        },
    },
    subpackages: {
        subpackage_chat: {
            subpackageId: "subpackage_chat",
            name: "chat",
            endpoints: [
                {
                    environments: [
                        {
                            id: "Default",
                            baseUrl: "https://api.reka.ai/v1",
                        },
                    ],
                    defaultEnvironment: "Default",
                    urlSlug: "create",
                    migratedFromUrlSlugs: ["chat"],
                    method: "POST",
                    id: "create",
                    originalEndpointId: "endpoint_chat.create",
                    name: "Chat",
                    path: {
                        pathParameters: [],
                        parts: [
                            {
                                type: "literal",
                                value: "",
                            },
                            {
                                type: "literal",
                                value: "/chat",
                            },
                        ],
                    },
                    queryParameters: [],
                    headers: [],
                    request: {
                        contentType: "application/json",
                        type: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    description:
                                        "Parameter which penalises tokens based on their frequency in the model's output so far. The larger the value, the higher the penalisation. 0.0 means no frequency penalty. Defaults to 0.0.",
                                    key: "frequency_penalty",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                },
                                {
                                    description:
                                        "The maximum number of new tokens to be generated by the model. Note that this is limited by the model's context length. Defaults to 1024.",
                                    key: "max_tokens",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "integer",
                                            },
                                        },
                                    },
                                },
                                {
                                    description: "List of messages specifying the conversation so far.",
                                    key: "messages",
                                    valueType: {
                                        type: "list",
                                        itemType: {
                                            type: "id",
                                            value: "type_:ChatMessage",
                                        },
                                    },
                                },
                                {
                                    description: "See [Available Models](/available-models) for possible values.",
                                    key: "model",
                                    valueType: {
                                        type: "primitive",
                                        value: {
                                            type: "string",
                                        },
                                    },
                                },
                                {
                                    description:
                                        "Parameter which penalises tokens based on whether they have appeared in the model's output so far. The larger the value, the higher the penalisation. 0.0 means no presence penalty. Defaults to 0.0.",
                                    key: "presence_penalty",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                },
                                {
                                    description:
                                        "Random seed used for generations. The same value forces the model to sample the same output.",
                                    key: "seed",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "integer",
                                            },
                                        },
                                    },
                                },
                                {
                                    description:
                                        "A list of stop strings used to control generation. If the model generates one of these, it will stop.",
                                    key: "stop",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "list",
                                            itemType: {
                                                type: "primitive",
                                                value: {
                                                    type: "string",
                                                },
                                            },
                                        },
                                    },
                                },
                                {
                                    description:
                                        "Set to true to enable streaming. See [Chat Streaming](/chat#streaming)",
                                    key: "stream",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "boolean",
                                            },
                                        },
                                    },
                                },
                                {
                                    description:
                                        "Positive number representing the temperature to use for generation. Higher values will make the output more unformly random or *creative*. 0.0 means greedy decoding. Defaults to 0.4.",
                                    key: "temperature",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                },
                                {
                                    description:
                                        "Parameter which forces the model to only consider the tokens with the `top_k` highest probabilities at the next step. Defaults to 1024.",
                                    key: "top_k",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "integer",
                                            },
                                        },
                                    },
                                },
                                {
                                    description:
                                        "Parameter used to do nucleus sampling, i.e. only consider tokens comprising the `top_p` probability of the next token's distribution. Defaults to 0.95.",
                                    key: "top_p",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "double",
                                            },
                                        },
                                    },
                                },
                                {
                                    description:
                                        "Whether to consider using search engine to complete the request. Note that even if this is set to `True`, the model might decide to not use search.",
                                    key: "use_search_engine",
                                    valueType: {
                                        type: "optional",
                                        itemType: {
                                            type: "primitive",
                                            value: {
                                                type: "boolean",
                                            },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    response: {
                        type: {
                            type: "reference",
                            value: {
                                type: "id",
                                value: "type_chat:ChatCreateResponse",
                            },
                        },
                    },
                    errors: [],
                    errorsV2: [
                        {
                            type: {
                                type: "alias",
                                value: {
                                    type: "id",
                                    value: "type_:HTTPValidationError",
                                },
                            },
                            statusCode: 422,
                            description: "Validation Error",
                            examples: [],
                        },
                    ],
                    examples: [
                        {
                            name: "Single turn",
                            path: "/chat",
                            pathParameters: {},
                            queryParameters: {},
                            headers: {},
                            requestBody: {
                                stream: false,
                                model: "reka-core",
                                messages: [
                                    {
                                        role: "user",
                                        content: "What is the fifth prime number?",
                                    },
                                ],
                            },
                            responseStatusCode: 200,
                            responseBody: {
                                id: "a22157d5-6712-4f0d-b6d1-0143e0511986",
                                model: "reka-core",
                                responses: [
                                    {
                                        finish_reason: "stop",
                                        message: {
                                            content:
                                                " The fifth prime number is 11. Here's a quick breakdown of the first five prime numbers in order: 2, 3, 5, 7, 11.\n\n",
                                            role: "assistant",
                                        },
                                    },
                                ],
                                usage: {
                                    input_tokens: 14,
                                    output_tokens: 40,
                                },
                            },
                            codeExamples: {
                                nodeAxios: "",
                                pythonSdk: {
                                    // type: "python",
                                    // sdk: {
                                    //     version: "3.0.6",
                                    //     package: "reka-api",
                                    // },
                                    async_client:
                                        'from reka import ChatMessage\nfrom reka.client import AsyncReka\n\nclient = AsyncReka(\n    api_key="YOUR_API_KEY",\n)\nawait client.chat.create(\n    model="reka-core",\n    messages=[\n        ChatMessage(\n            role="user",\n            content="What is the fifth prime number?",\n        )\n    ],\n)\n',
                                    sync_client:
                                        'from reka import ChatMessage\nfrom reka.client import Reka\n\nclient = Reka(\n    api_key="YOUR_API_KEY",\n)\nclient.chat.create(\n    model="reka-core",\n    messages=[\n        ChatMessage(\n            role="user",\n            content="What is the fifth prime number?",\n        )\n    ],\n)\n',
                                    // exampleIdentifier: "Single turn",
                                },
                            },
                            requestBodyV3: {
                                type: "json",
                                value: {
                                    stream: false,
                                    model: "reka-core",
                                    messages: [
                                        {
                                            role: "user",
                                            content: "What is the fifth prime number?",
                                        },
                                    ],
                                },
                            },
                            responseBodyV3: {
                                type: "json",
                                value: {
                                    id: "a22157d5-6712-4f0d-b6d1-0143e0511986",
                                    model: "reka-core",
                                    responses: [
                                        {
                                            finish_reason: "stop",
                                            message: {
                                                content:
                                                    " The fifth prime number is 11. Here's a quick breakdown of the first five prime numbers in order: 2, 3, 5, 7, 11.\n\n",
                                                role: "assistant",
                                            },
                                        },
                                    ],
                                    usage: {
                                        input_tokens: 14,
                                        output_tokens: 40,
                                    },
                                },
                            },
                            codeSamples: [],
                        },
                        {
                            name: "Multiple turns",
                            path: "/chat",
                            pathParameters: {},
                            queryParameters: {},
                            headers: {},
                            requestBody: {
                                stream: false,
                                model: "reka-core",
                                messages: [
                                    {
                                        role: "user",
                                        content: "My name is Matt.",
                                    },
                                    {
                                        role: "assistant",
                                        content: "Nice to meet you.",
                                    },
                                    {
                                        role: "user",
                                        content: "What was my name?",
                                    },
                                ],
                            },
                            responseStatusCode: 200,
                            responseBody: {
                                id: "7cbdff68-c840-4390-ade7-30ffda8fd1c4",
                                model: "reka-core",
                                responses: [
                                    {
                                        finish_reason: "stop",
                                        message: {
                                            content:
                                                " Hello! Based on the information you provided, your name is Matt. If you have a different name or would like to use a different name, feel free to let me know!\n\n",
                                            role: "assistant",
                                        },
                                    },
                                ],
                                usage: {
                                    input_tokens: 32,
                                    output_tokens: 39,
                                },
                            },
                            codeExamples: {
                                nodeAxios: "",
                                pythonSdk: {
                                    // type: "python",
                                    // sdk: {
                                    //     version: "3.0.6",
                                    //     package: "reka-api",
                                    // },
                                    async_client:
                                        'from reka import ChatMessage\nfrom reka.client import AsyncReka\n\nclient = AsyncReka(\n    api_key="YOUR_API_KEY",\n)\nawait client.chat.create(\n    model="reka-core",\n    messages=[\n        ChatMessage(\n            role="user",\n            content="My name is Matt.",\n        ),\n        ChatMessage(\n            role="assistant",\n            content="Nice to meet you.",\n        ),\n        ChatMessage(\n            role="user",\n            content="What was my name?",\n        ),\n    ],\n)\n',
                                    sync_client:
                                        'from reka import ChatMessage\nfrom reka.client import Reka\n\nclient = Reka(\n    api_key="YOUR_API_KEY",\n)\nclient.chat.create(\n    model="reka-core",\n    messages=[\n        ChatMessage(\n            role="user",\n            content="My name is Matt.",\n        ),\n        ChatMessage(\n            role="assistant",\n            content="Nice to meet you.",\n        ),\n        ChatMessage(\n            role="user",\n            content="What was my name?",\n        ),\n    ],\n)\n',
                                    // exampleIdentifier: "Multiple turns",
                                },
                            },
                            requestBodyV3: {
                                type: "json",
                                value: {
                                    stream: false,
                                    model: "reka-core",
                                    messages: [
                                        {
                                            role: "user",
                                            content: "My name is Matt.",
                                        },
                                        {
                                            role: "assistant",
                                            content: "Nice to meet you.",
                                        },
                                        {
                                            role: "user",
                                            content: "What was my name?",
                                        },
                                    ],
                                },
                            },
                            responseBodyV3: {
                                type: "json",
                                value: {
                                    id: "7cbdff68-c840-4390-ade7-30ffda8fd1c4",
                                    model: "reka-core",
                                    responses: [
                                        {
                                            finish_reason: "stop",
                                            message: {
                                                content:
                                                    " Hello! Based on the information you provided, your name is Matt. If you have a different name or would like to use a different name, feel free to let me know!\n\n",
                                                role: "assistant",
                                            },
                                        },
                                    ],
                                    usage: {
                                        input_tokens: 32,
                                        output_tokens: 39,
                                    },
                                },
                            },
                            codeSamples: [],
                        },
                        {
                            name: "Multimodal",
                            path: "/chat",
                            pathParameters: {},
                            queryParameters: {},
                            headers: {},
                            requestBody: {
                                stream: false,
                                model: "reka-core",
                                messages: [
                                    {
                                        role: "user",
                                        content: [
                                            {
                                                type: "image_url",
                                                image_url: "https://v0.docs.reka.ai/_images/000000245576.jpg",
                                            },
                                            {
                                                type: "text",
                                                text: "What animal is this? Answer briefly.",
                                            },
                                        ],
                                    },
                                ],
                            },
                            responseStatusCode: 200,
                            responseBody: {
                                id: "dc3c498e-36b2-4bc4-8119-e2bcb3fcd5e4",
                                model: "reka-core",
                                responses: [
                                    {
                                        finish_reason: "stop",
                                        message: {
                                            content:
                                                " The animal in the image is a domestic cat. Specifically, it appears to be a ginger or orange tabby cat, which is characterized by its reddish-brown fur with darker stripes or patches. The cat is engaging in a common feline behavior of sniffing or licking objects, which in this case is a computer keyboard. Cats are known for their curiosity and often explore their environment by using their sense of smell, which is highly developed. The act of licking or sniffing can also be a way for cats to mark their territory with pheromones from their saliva.",
                                            role: "assistant",
                                        },
                                    },
                                ],
                                usage: {
                                    input_tokens: 654,
                                    output_tokens: 117,
                                },
                            },
                            codeExamples: {
                                nodeAxios: "",
                                pythonSdk: {
                                    // type: "python",
                                    // sdk: {
                                    //     version: "3.0.6",
                                    //     package: "reka-api",
                                    // },
                                    async_client:
                                        'from reka import ChatMessage, TypedMediaContent, TypedText\nfrom reka.client import AsyncReka\n\nclient = AsyncReka(\n    api_key="YOUR_API_KEY",\n)\nawait client.chat.create(\n    model="reka-core",\n    messages=[\n        ChatMessage(\n            role="user",\n            content=[\n                TypedMediaContent(\n                    type="image_url",\n                    image_url="https://v0.docs.reka.ai/_images/000000245576.jpg",\n                ),\n                TypedText(\n                    type="text",\n                    text="What animal is this? Answer briefly.",\n                ),\n            ],\n        )\n    ],\n)\n',
                                    sync_client:
                                        'from reka import ChatMessage, TypedMediaContent, TypedText\nfrom reka.client import Reka\n\nclient = Reka(\n    api_key="YOUR_API_KEY",\n)\nclient.chat.create(\n    model="reka-core",\n    messages=[\n        ChatMessage(\n            role="user",\n            content=[\n                TypedMediaContent(\n                    type="image_url",\n                    image_url="https://v0.docs.reka.ai/_images/000000245576.jpg",\n                ),\n                TypedText(\n                    type="text",\n                    text="What animal is this? Answer briefly.",\n                ),\n            ],\n        )\n    ],\n)\n',
                                    // exampleIdentifier: "Multimodal",
                                },
                            },
                            requestBodyV3: {
                                type: "json",
                                value: {
                                    stream: false,
                                    model: "reka-core",
                                    messages: [
                                        {
                                            role: "user",
                                            content: [
                                                {
                                                    type: "image_url",
                                                    image_url: "https://v0.docs.reka.ai/_images/000000245576.jpg",
                                                },
                                                {
                                                    type: "text",
                                                    text: "What animal is this? Answer briefly.",
                                                },
                                            ],
                                        },
                                    ],
                                },
                            },
                            responseBodyV3: {
                                type: "json",
                                value: {
                                    id: "dc3c498e-36b2-4bc4-8119-e2bcb3fcd5e4",
                                    model: "reka-core",
                                    responses: [
                                        {
                                            finish_reason: "stop",
                                            message: {
                                                content:
                                                    " The animal in the image is a domestic cat. Specifically, it appears to be a ginger or orange tabby cat, which is characterized by its reddish-brown fur with darker stripes or patches. The cat is engaging in a common feline behavior of sniffing or licking objects, which in this case is a computer keyboard. Cats are known for their curiosity and often explore their environment by using their sense of smell, which is highly developed. The act of licking or sniffing can also be a way for cats to mark their territory with pheromones from their saliva.",
                                                role: "assistant",
                                            },
                                        },
                                    ],
                                    usage: {
                                        input_tokens: 654,
                                        output_tokens: 117,
                                    },
                                },
                            },
                            codeSamples: [],
                        },
                        {
                            path: "/chat",
                            pathParameters: {},
                            queryParameters: {},
                            headers: {},
                            responseStatusCode: 422,
                            codeExamples: {
                                nodeAxios: "",
                                pythonSdk: {
                                    // type: "python",
                                    // sdk: {
                                    //     version: "3.0.6",
                                    //     package: "reka-api",
                                    // },
                                    async_client:
                                        'from reka import ChatMessage\nfrom reka.client import AsyncReka\n\nclient = AsyncReka(\n    api_key="YOUR_API_KEY",\n)\nresponse = await client.chat.create_stream(\n    frequency_penalty=1.1,\n    max_tokens=1,\n    messages=[\n        ChatMessage(\n            content="string",\n            role="user",\n        )\n    ],\n    model="string",\n    presence_penalty=1.1,\n    seed=1,\n    stop=["string"],\n    temperature=1.1,\n    top_k=1,\n    top_p=1.1,\n    use_search_engine=True,\n)\nasync for chunk in response:\n    yield chunk\n',
                                    sync_client:
                                        'from reka import ChatMessage\nfrom reka.client import Reka\n\nclient = Reka(\n    api_key="YOUR_API_KEY",\n)\nresponse = client.chat.create_stream(\n    frequency_penalty=1.1,\n    max_tokens=1,\n    messages=[\n        ChatMessage(\n            content="string",\n            role="user",\n        )\n    ],\n    model="string",\n    presence_penalty=1.1,\n    seed=1,\n    stop=["string"],\n    temperature=1.1,\n    top_k=1,\n    top_p=1.1,\n    use_search_engine=True,\n)\nfor chunk in response:\n    yield chunk\n',
                                    // exampleIdentifier: "default",
                                },
                            },
                            requestBodyV3: {
                                type: "json",
                                value: {
                                    messages: [
                                        {
                                            content: "string",
                                            role: "user",
                                        },
                                    ],
                                    model: "string",
                                },
                            },
                            responseBodyV3: {
                                type: "json",
                                value: {
                                    detail: [
                                        {
                                            loc: ["string"],
                                            msg: "string",
                                            type: "string",
                                        },
                                    ],
                                },
                            },
                            codeSamples: [],
                        },
                    ],
                    authed: true,
                },
            ],
            types: ["type_chat:ChatCreateResponse"],
            subpackages: [],
            urlSlug: "chat",
            webhooks: [],
            websockets: [],
        },
        subpackage_models: {
            subpackageId: "subpackage_models",
            name: "models",
            endpoints: [
                {
                    environments: [
                        {
                            id: "Default",
                            baseUrl: "https://api.reka.ai/v1",
                        },
                    ],
                    defaultEnvironment: "Default",
                    urlSlug: "get",
                    migratedFromUrlSlugs: ["get-models"],
                    method: "GET",
                    id: "get",
                    originalEndpointId: "endpoint_models.get",
                    name: "Get Models",
                    path: {
                        pathParameters: [],
                        parts: [
                            {
                                type: "literal",
                                value: "",
                            },
                            {
                                type: "literal",
                                value: "/models",
                            },
                        ],
                    },
                    queryParameters: [],
                    headers: [],
                    response: {
                        type: {
                            type: "reference",
                            value: {
                                type: "list",
                                itemType: {
                                    type: "id",
                                    value: "type_:Model",
                                },
                            },
                        },
                    },
                    errors: [],
                    errorsV2: [],
                    examples: [
                        {
                            path: "/models",
                            pathParameters: {},
                            queryParameters: {},
                            headers: {},
                            responseStatusCode: 200,
                            responseBody: [
                                {
                                    id: "reka-core",
                                },
                                {
                                    id: "reka-core-20240415",
                                },
                                {
                                    id: "reka-core-20240501",
                                },
                                {
                                    id: "reka-flash",
                                },
                                {
                                    id: "reka-flash-20240226",
                                },
                                {
                                    id: "reka-edge",
                                },
                                {
                                    id: "reka-edge-20240208",
                                },
                            ],
                            codeExamples: {
                                nodeAxios: "",
                                pythonSdk: {
                                    // type: "python",
                                    // sdk: {
                                    //     version: "3.0.6",
                                    //     package: "reka-api",
                                    // },
                                    async_client:
                                        'from reka.client import AsyncReka\n\nclient = AsyncReka(\n    api_key="YOUR_API_KEY",\n)\nawait client.models.get()\n',
                                    sync_client:
                                        'from reka.client import Reka\n\nclient = Reka(\n    api_key="YOUR_API_KEY",\n)\nclient.models.get()\n',
                                    // exampleIdentifier: "default",
                                },
                            },
                            responseBodyV3: {
                                type: "json",
                                value: [
                                    {
                                        id: "reka-core",
                                    },
                                    {
                                        id: "reka-core-20240415",
                                    },
                                    {
                                        id: "reka-core-20240501",
                                    },
                                    {
                                        id: "reka-flash",
                                    },
                                    {
                                        id: "reka-flash-20240226",
                                    },
                                    {
                                        id: "reka-edge",
                                    },
                                    {
                                        id: "reka-edge-20240208",
                                    },
                                ],
                            },
                            codeSamples: [],
                        },
                    ],
                    description: "List models available to the user.",
                    authed: true,
                },
            ],
            types: [],
            subpackages: [],
            urlSlug: "models",
            webhooks: [],
            websockets: [],
        },
    },
    auth: {
        type: "header",
        headerWireValue: "X-Api-Key",
        nameOverride: "apiKey",
    },
    hasMultipleBaseUrls: false,
    globalHeaders: [],
};
