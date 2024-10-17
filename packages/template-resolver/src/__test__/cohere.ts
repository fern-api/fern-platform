import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";

export const CHAT_COMPLETION_SNIPPET: FernRegistry.EndpointSnippetTemplate = {
    sdk: {
        type: "typescript",
        package: "cohere-ai",
        version: "7.10.3",
    },
    endpointId: {
        path: FernRegistry.EndpointPathLiteral("/chat"),
        method: "POST",
        identifierOverride: "endpoint_.chat_stream",
    },
    snippetTemplate: {
        type: "v1",
        functionInvocation: {
            type: "generic",
            imports: [],
            templateString: "await cohere.chatStream(\n\t$FERN_INPUT\n)",
            isOptional: false,
            inputDelimiter: ",\n\t",
            templateInputs: [
                {
                    type: "template",
                    value: {
                        type: "generic",
                        imports: [],
                        templateString: "{\n\t\t$FERN_INPUT\n\t}",
                        isOptional: true,
                        inputDelimiter: ",\n\t\t",
                        templateInputs: [
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "message: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "message",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "model: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "model",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "preamble: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "preamble",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "chatHistory: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "discriminatedUnion",
                                        imports: [],
                                        isOptional: true,
                                        templateString: "$FERN_INPUT",
                                        discriminantField: "role",
                                        members: {
                                            CHATBOT: {
                                                type: "generic",
                                                imports: [],
                                                templateString:
                                                    '{ \n\t\t\t\trole: "CHATBOT", \n\t\t\t\t$FERN_INPUT\n\t\t\t}',
                                                isOptional: true,
                                                templateInputs: [
                                                    {
                                                        type: "template",
                                                        value: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            inputDelimiter: ",\n\t\t\t\t",
                                                            templateInputs: [
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "generic",
                                                                        imports: [],
                                                                        templateString: "message: $FERN_INPUT",
                                                                        isOptional: true,
                                                                        templateInputs: [
                                                                            {
                                                                                type: "payload",
                                                                                location: "RELATIVE",
                                                                                path: "message",
                                                                            },
                                                                        ],
                                                                        inputDelimiter: undefined,
                                                                    },
                                                                },
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "iterable",
                                                                        imports: [],
                                                                        isOptional: true,
                                                                        containerTemplateString:
                                                                            "toolCalls: [\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t]",
                                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                                        innerTemplate: {
                                                                            type: "generic",
                                                                            imports: [],
                                                                            templateString:
                                                                                "{\n\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t}",
                                                                            isOptional: true,
                                                                            inputDelimiter: ",\n\t\t\t\t\t\t\t",
                                                                            templateInputs: [
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "generic",
                                                                                        imports: [],
                                                                                        templateString:
                                                                                            "name: $FERN_INPUT",
                                                                                        isOptional: true,
                                                                                        templateInputs: [
                                                                                            {
                                                                                                type: "payload",
                                                                                                location: "RELATIVE",
                                                                                                path: "name",
                                                                                            },
                                                                                        ],
                                                                                        inputDelimiter: undefined,
                                                                                    },
                                                                                },
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "dict",
                                                                                        imports: [],
                                                                                        isOptional: true,
                                                                                        containerTemplateString:
                                                                                            "parameters: {\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t}",
                                                                                        delimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        keyValueSeparator: ": ",
                                                                                        keyTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        valueTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        templateInput: {
                                                                                            location: "RELATIVE",
                                                                                            path: "parameters",
                                                                                        },
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        templateInput: {
                                                                            location: "RELATIVE",
                                                                            path: "tool_calls",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                ],
                                                inputDelimiter: undefined,
                                            },
                                            SYSTEM: {
                                                type: "generic",
                                                imports: [],
                                                templateString:
                                                    '{ \n\t\t\t\trole: "SYSTEM", \n\t\t\t\t$FERN_INPUT\n\t\t\t}',
                                                isOptional: true,
                                                templateInputs: [
                                                    {
                                                        type: "template",
                                                        value: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            inputDelimiter: ",\n\t\t\t\t",
                                                            templateInputs: [
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "generic",
                                                                        imports: [],
                                                                        templateString: "message: $FERN_INPUT",
                                                                        isOptional: true,
                                                                        templateInputs: [
                                                                            {
                                                                                type: "payload",
                                                                                location: "RELATIVE",
                                                                                path: "message",
                                                                            },
                                                                        ],
                                                                        inputDelimiter: undefined,
                                                                    },
                                                                },
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "iterable",
                                                                        imports: [],
                                                                        isOptional: true,
                                                                        containerTemplateString:
                                                                            "toolCalls: [\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t]",
                                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                                        innerTemplate: {
                                                                            type: "generic",
                                                                            imports: [],
                                                                            templateString:
                                                                                "{\n\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t}",
                                                                            isOptional: true,
                                                                            inputDelimiter: ",\n\t\t\t\t\t\t\t",
                                                                            templateInputs: [
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "generic",
                                                                                        imports: [],
                                                                                        templateString:
                                                                                            "name: $FERN_INPUT",
                                                                                        isOptional: true,
                                                                                        templateInputs: [
                                                                                            {
                                                                                                type: "payload",
                                                                                                location: "RELATIVE",
                                                                                                path: "name",
                                                                                            },
                                                                                        ],
                                                                                        inputDelimiter: undefined,
                                                                                    },
                                                                                },
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "dict",
                                                                                        imports: [],
                                                                                        isOptional: true,
                                                                                        containerTemplateString:
                                                                                            "parameters: {\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t}",
                                                                                        delimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        keyValueSeparator: ": ",
                                                                                        keyTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        valueTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        templateInput: {
                                                                                            location: "RELATIVE",
                                                                                            path: "parameters",
                                                                                        },
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        templateInput: {
                                                                            location: "RELATIVE",
                                                                            path: "tool_calls",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                ],
                                                inputDelimiter: undefined,
                                            },
                                            USER: {
                                                type: "generic",
                                                imports: [],
                                                templateString:
                                                    '{ \n\t\t\t\trole: "USER", \n\t\t\t\t$FERN_INPUT\n\t\t\t}',
                                                isOptional: true,
                                                templateInputs: [
                                                    {
                                                        type: "template",
                                                        value: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            inputDelimiter: ",\n\t\t\t\t",
                                                            templateInputs: [
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "generic",
                                                                        imports: [],
                                                                        templateString: "message: $FERN_INPUT",
                                                                        isOptional: true,
                                                                        templateInputs: [
                                                                            {
                                                                                type: "payload",
                                                                                location: "RELATIVE",
                                                                                path: "message",
                                                                            },
                                                                        ],
                                                                        inputDelimiter: undefined,
                                                                    },
                                                                },
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "iterable",
                                                                        imports: [],
                                                                        isOptional: true,
                                                                        containerTemplateString:
                                                                            "toolCalls: [\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t]",
                                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                                        innerTemplate: {
                                                                            type: "generic",
                                                                            imports: [],
                                                                            templateString:
                                                                                "{\n\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t}",
                                                                            isOptional: true,
                                                                            inputDelimiter: ",\n\t\t\t\t\t\t\t",
                                                                            templateInputs: [
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "generic",
                                                                                        imports: [],
                                                                                        templateString:
                                                                                            "name: $FERN_INPUT",
                                                                                        isOptional: true,
                                                                                        templateInputs: [
                                                                                            {
                                                                                                type: "payload",
                                                                                                location: "RELATIVE",
                                                                                                path: "name",
                                                                                            },
                                                                                        ],
                                                                                        inputDelimiter: undefined,
                                                                                    },
                                                                                },
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "dict",
                                                                                        imports: [],
                                                                                        isOptional: true,
                                                                                        containerTemplateString:
                                                                                            "parameters: {\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t}",
                                                                                        delimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        keyValueSeparator: ": ",
                                                                                        keyTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        valueTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        templateInput: {
                                                                                            location: "RELATIVE",
                                                                                            path: "parameters",
                                                                                        },
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        templateInput: {
                                                                            location: "RELATIVE",
                                                                            path: "tool_calls",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                ],
                                                inputDelimiter: undefined,
                                            },
                                            TOOL: {
                                                type: "generic",
                                                imports: [],
                                                templateString:
                                                    '{ \n\t\t\t\trole: "TOOL", \n\t\t\t\t$FERN_INPUT\n\t\t\t}',
                                                isOptional: true,
                                                templateInputs: [
                                                    {
                                                        type: "template",
                                                        value: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            inputDelimiter: ",\n\t\t\t\t",
                                                            templateInputs: [
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "iterable",
                                                                        imports: [],
                                                                        isOptional: true,
                                                                        containerTemplateString:
                                                                            "toolResults: [\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t]",
                                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                                        innerTemplate: {
                                                                            type: "generic",
                                                                            imports: [],
                                                                            templateString:
                                                                                "{\n\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t}",
                                                                            isOptional: true,
                                                                            inputDelimiter: ",\n\t\t\t\t\t\t\t",
                                                                            templateInputs: [
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "generic",
                                                                                        imports: [],
                                                                                        templateString:
                                                                                            "call: {\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t}",
                                                                                        isOptional: true,
                                                                                        inputDelimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        templateInputs: [
                                                                                            {
                                                                                                type: "template",
                                                                                                value: {
                                                                                                    type: "generic",
                                                                                                    imports: [],
                                                                                                    templateString:
                                                                                                        "name: $FERN_INPUT",
                                                                                                    isOptional: true,
                                                                                                    templateInputs: [
                                                                                                        {
                                                                                                            type: "payload",
                                                                                                            location:
                                                                                                                "RELATIVE",
                                                                                                            path: "call.name",
                                                                                                        },
                                                                                                    ],
                                                                                                    inputDelimiter:
                                                                                                        undefined,
                                                                                                },
                                                                                            },
                                                                                            {
                                                                                                type: "template",
                                                                                                value: {
                                                                                                    type: "dict",
                                                                                                    imports: [],
                                                                                                    isOptional: true,
                                                                                                    containerTemplateString:
                                                                                                        "parameters: {\n\t\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t\t}",
                                                                                                    delimiter:
                                                                                                        ",\n\t\t\t\t\t\t\t\t\t",
                                                                                                    keyValueSeparator:
                                                                                                        ": ",
                                                                                                    keyTemplate: {
                                                                                                        type: "generic",
                                                                                                        imports: [],
                                                                                                        templateString:
                                                                                                            "$FERN_INPUT",
                                                                                                        isOptional:
                                                                                                            true,
                                                                                                        templateInputs:
                                                                                                            [
                                                                                                                {
                                                                                                                    type: "payload",
                                                                                                                    location:
                                                                                                                        "RELATIVE",
                                                                                                                    path: undefined,
                                                                                                                },
                                                                                                            ],
                                                                                                        inputDelimiter:
                                                                                                            undefined,
                                                                                                    },
                                                                                                    valueTemplate: {
                                                                                                        type: "generic",
                                                                                                        imports: [],
                                                                                                        templateString:
                                                                                                            "$FERN_INPUT",
                                                                                                        isOptional:
                                                                                                            true,
                                                                                                        templateInputs:
                                                                                                            [
                                                                                                                {
                                                                                                                    type: "payload",
                                                                                                                    location:
                                                                                                                        "RELATIVE",
                                                                                                                    path: undefined,
                                                                                                                },
                                                                                                            ],
                                                                                                        inputDelimiter:
                                                                                                            undefined,
                                                                                                    },
                                                                                                    templateInput: {
                                                                                                        location:
                                                                                                            "RELATIVE",
                                                                                                        path: "call.parameters",
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        ],
                                                                                    },
                                                                                },
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "iterable",
                                                                                        imports: [],
                                                                                        isOptional: true,
                                                                                        containerTemplateString:
                                                                                            "outputs: [\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t]",
                                                                                        delimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        innerTemplate: {
                                                                                            type: "dict",
                                                                                            imports: [],
                                                                                            isOptional: true,
                                                                                            containerTemplateString:
                                                                                                "{\n\t\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t\t}",
                                                                                            delimiter:
                                                                                                ",\n\t\t\t\t\t\t\t\t\t",
                                                                                            keyValueSeparator: ": ",
                                                                                            keyTemplate: {
                                                                                                type: "generic",
                                                                                                imports: [],
                                                                                                templateString:
                                                                                                    "$FERN_INPUT",
                                                                                                isOptional: true,
                                                                                                templateInputs: [
                                                                                                    {
                                                                                                        type: "payload",
                                                                                                        location:
                                                                                                            "RELATIVE",
                                                                                                        path: undefined,
                                                                                                    },
                                                                                                ],
                                                                                                inputDelimiter:
                                                                                                    undefined,
                                                                                            },
                                                                                            valueTemplate: {
                                                                                                type: "generic",
                                                                                                imports: [],
                                                                                                templateString:
                                                                                                    "$FERN_INPUT",
                                                                                                isOptional: true,
                                                                                                templateInputs: [
                                                                                                    {
                                                                                                        type: "payload",
                                                                                                        location:
                                                                                                            "RELATIVE",
                                                                                                        path: undefined,
                                                                                                    },
                                                                                                ],
                                                                                                inputDelimiter:
                                                                                                    undefined,
                                                                                            },
                                                                                            templateInput: {
                                                                                                location: "RELATIVE",
                                                                                                path: undefined,
                                                                                            },
                                                                                        },
                                                                                        templateInput: {
                                                                                            location: "RELATIVE",
                                                                                            path: "outputs",
                                                                                        },
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        templateInput: {
                                                                            location: "RELATIVE",
                                                                            path: "tool_results",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                ],
                                                inputDelimiter: undefined,
                                            },
                                        },
                                        templateInput: {
                                            location: "RELATIVE",
                                            path: undefined,
                                        },
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "chat_history",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "conversationId: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "conversation_id",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "enum",
                                    imports: [],
                                    isOptional: true,
                                    values: {
                                        OFF: "Cohere.ChatStreamRequestPromptTruncation.Off",
                                        AUTO: "Cohere.ChatStreamRequestPromptTruncation.Auto",
                                        AUTO_PRESERVE_ORDER:
                                            "Cohere.ChatStreamRequestPromptTruncation.AutoPreserveOrder",
                                    },
                                    templateString: "promptTruncation: $FERN_INPUT",
                                    templateInput: {
                                        location: "BODY",
                                        path: "prompt_truncation",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "connectors: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "generic",
                                        imports: [],
                                        templateString: "{\n\t\t\t\t$FERN_INPUT\n\t\t\t}",
                                        isOptional: true,
                                        inputDelimiter: ",\n\t\t\t\t",
                                        templateInputs: [
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "id: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "id",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "userAccessToken: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "user_access_token",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "continueOnFailure: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "continue_on_failure",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "dict",
                                                    imports: [],
                                                    isOptional: true,
                                                    containerTemplateString:
                                                        "options: {\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t}",
                                                    delimiter: ",\n\t\t\t\t\t",
                                                    keyValueSeparator: ": ",
                                                    keyTemplate: {
                                                        type: "generic",
                                                        imports: [],
                                                        templateString: "$FERN_INPUT",
                                                        isOptional: true,
                                                        templateInputs: [
                                                            {
                                                                type: "payload",
                                                                location: "RELATIVE",
                                                                path: undefined,
                                                            },
                                                        ],
                                                        inputDelimiter: undefined,
                                                    },
                                                    valueTemplate: {
                                                        type: "generic",
                                                        imports: [],
                                                        templateString: "$FERN_INPUT",
                                                        isOptional: true,
                                                        templateInputs: [
                                                            {
                                                                type: "payload",
                                                                location: "RELATIVE",
                                                                path: undefined,
                                                            },
                                                        ],
                                                        inputDelimiter: undefined,
                                                    },
                                                    templateInput: {
                                                        location: "RELATIVE",
                                                        path: "options",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "connectors",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "searchQueriesOnly: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "search_queries_only",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "documents: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "dict",
                                        imports: [],
                                        isOptional: true,
                                        containerTemplateString: "{\n\t\t\t\t$FERN_INPUT\n\t\t\t}",
                                        delimiter: ",\n\t\t\t\t",
                                        keyValueSeparator: ": ",
                                        keyTemplate: {
                                            type: "generic",
                                            imports: [],
                                            templateString: "$FERN_INPUT",
                                            isOptional: true,
                                            templateInputs: [
                                                {
                                                    type: "payload",
                                                    location: "RELATIVE",
                                                    path: undefined,
                                                },
                                            ],
                                            inputDelimiter: undefined,
                                        },
                                        valueTemplate: {
                                            type: "generic",
                                            imports: [],
                                            templateString: "$FERN_INPUT",
                                            isOptional: true,
                                            templateInputs: [
                                                {
                                                    type: "payload",
                                                    location: "RELATIVE",
                                                    path: undefined,
                                                },
                                            ],
                                            inputDelimiter: undefined,
                                        },
                                        templateInput: {
                                            location: "RELATIVE",
                                            path: undefined,
                                        },
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "documents",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "enum",
                                    imports: [],
                                    isOptional: true,
                                    values: {
                                        fast: "Cohere.ChatStreamRequestCitationQuality.Fast",
                                        accurate: "Cohere.ChatStreamRequestCitationQuality.Accurate",
                                    },
                                    templateString: "citationQuality: $FERN_INPUT",
                                    templateInput: {
                                        location: "BODY",
                                        path: "citation_quality",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "temperature: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "temperature",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "maxTokens: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "max_tokens",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "maxInputTokens: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "max_input_tokens",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "k: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "k",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "p: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "p",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "seed: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "seed",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "stopSequences: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "generic",
                                        imports: [],
                                        templateString: "$FERN_INPUT",
                                        isOptional: true,
                                        templateInputs: [
                                            {
                                                type: "payload",
                                                location: "RELATIVE",
                                                path: undefined,
                                            },
                                        ],
                                        inputDelimiter: undefined,
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "stop_sequences",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "frequencyPenalty: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "frequency_penalty",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "presencePenalty: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "presence_penalty",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "rawPrompting: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "raw_prompting",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "returnPrompt: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "return_prompt",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "tools: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "generic",
                                        imports: [],
                                        templateString: "{\n\t\t\t\t$FERN_INPUT\n\t\t\t}",
                                        isOptional: true,
                                        inputDelimiter: ",\n\t\t\t\t",
                                        templateInputs: [
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "name: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "name",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "description: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "description",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "dict",
                                                    imports: [],
                                                    isOptional: true,
                                                    containerTemplateString:
                                                        "parameterDefinitions: {\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t}",
                                                    delimiter: ",\n\t\t\t\t\t",
                                                    keyValueSeparator: ": ",
                                                    keyTemplate: {
                                                        type: "generic",
                                                        imports: [],
                                                        templateString: "$FERN_INPUT",
                                                        isOptional: true,
                                                        templateInputs: [
                                                            {
                                                                type: "payload",
                                                                location: "RELATIVE",
                                                                path: undefined,
                                                            },
                                                        ],
                                                        inputDelimiter: undefined,
                                                    },
                                                    valueTemplate: {
                                                        type: "generic",
                                                        imports: [],
                                                        templateString: "{\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t}",
                                                        isOptional: true,
                                                        inputDelimiter: ",\n\t\t\t\t\t\t",
                                                        templateInputs: [
                                                            {
                                                                type: "template",
                                                                value: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "description: $FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: "description",
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                            },
                                                            {
                                                                type: "template",
                                                                value: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "type: $FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: "type",
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                            },
                                                            {
                                                                type: "template",
                                                                value: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "required: $FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: "required",
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    templateInput: {
                                                        location: "RELATIVE",
                                                        path: "parameter_definitions",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "tools",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "toolResults: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "generic",
                                        imports: [],
                                        templateString: "{\n\t\t\t\t$FERN_INPUT\n\t\t\t}",
                                        isOptional: true,
                                        inputDelimiter: ",\n\t\t\t\t",
                                        templateInputs: [
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "call: {\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t}",
                                                    isOptional: true,
                                                    inputDelimiter: ",\n\t\t\t\t\t",
                                                    templateInputs: [
                                                        {
                                                            type: "template",
                                                            value: {
                                                                type: "generic",
                                                                imports: [],
                                                                templateString: "name: $FERN_INPUT",
                                                                isOptional: true,
                                                                templateInputs: [
                                                                    {
                                                                        type: "payload",
                                                                        location: "RELATIVE",
                                                                        path: "call.name",
                                                                    },
                                                                ],
                                                                inputDelimiter: undefined,
                                                            },
                                                        },
                                                        {
                                                            type: "template",
                                                            value: {
                                                                type: "dict",
                                                                imports: [],
                                                                isOptional: true,
                                                                containerTemplateString:
                                                                    "parameters: {\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t}",
                                                                delimiter: ",\n\t\t\t\t\t\t",
                                                                keyValueSeparator: ": ",
                                                                keyTemplate: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "$FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: undefined,
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                                valueTemplate: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "$FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: undefined,
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                                templateInput: {
                                                                    location: "RELATIVE",
                                                                    path: "call.parameters",
                                                                },
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "iterable",
                                                    imports: [],
                                                    isOptional: true,
                                                    containerTemplateString:
                                                        "outputs: [\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t]",
                                                    delimiter: ",\n\t\t\t\t\t",
                                                    innerTemplate: {
                                                        type: "dict",
                                                        imports: [],
                                                        isOptional: true,
                                                        containerTemplateString:
                                                            "{\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t}",
                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                        keyValueSeparator: ": ",
                                                        keyTemplate: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            templateInputs: [
                                                                {
                                                                    type: "payload",
                                                                    location: "RELATIVE",
                                                                    path: undefined,
                                                                },
                                                            ],
                                                            inputDelimiter: undefined,
                                                        },
                                                        valueTemplate: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            templateInputs: [
                                                                {
                                                                    type: "payload",
                                                                    location: "RELATIVE",
                                                                    path: undefined,
                                                                },
                                                            ],
                                                            inputDelimiter: undefined,
                                                        },
                                                        templateInput: {
                                                            location: "RELATIVE",
                                                            path: undefined,
                                                        },
                                                    },
                                                    templateInput: {
                                                        location: "RELATIVE",
                                                        path: "outputs",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "tool_results",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "forceSingleStep: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "force_single_step",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                        ],
                    },
                },
            ],
        },
        clientInstantiation: {
            imports: [],
            templateString: "const cohere = new CohereClient($FERN_INPUT);",
            isOptional: false,
            inputDelimiter: ",",
            templateInputs: [
                {
                    value: {
                        imports: [],
                        templateString: "{ $FERN_INPUT }",
                        isOptional: true,
                        templateInputs: [
                            {
                                value: {
                                    imports: [],
                                    templateString: "token: $FERN_INPUT",
                                    isOptional: false,
                                    templateInputs: [
                                        {
                                            location: "AUTH",
                                            path: "token",
                                            type: "payload",
                                        },
                                    ],
                                    type: "generic",
                                    inputDelimiter: undefined,
                                },
                                type: "template",
                            },
                            {
                                value: {
                                    imports: [],
                                    templateString: "clientName: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            location: "HEADERS",
                                            path: "X-Client-Name",
                                            type: "payload",
                                        },
                                    ],
                                    type: "generic",
                                    inputDelimiter: undefined,
                                },
                                type: "template",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                    type: "template",
                },
            ],
            type: "generic",
        },
    },
    apiDefinitionId: undefined,
    additionalTemplates: undefined,
};

export const CHAT_COMPLETION_SNIPPET_WITH_LEGACY_CLIENT_INSTANTIATION: FernRegistry.EndpointSnippetTemplate = {
    sdk: {
        type: "typescript",
        package: "cohere-ai",
        version: "7.10.3",
    },
    endpointId: {
        path: FernRegistry.EndpointPathLiteral("/chat"),
        method: "POST",
        identifierOverride: "endpoint_.chat_stream",
    },
    snippetTemplate: {
        type: "v1",
        functionInvocation: {
            type: "generic",
            imports: [],
            templateString: "await cohere.chatStream(\n\t$FERN_INPUT\n)",
            isOptional: false,
            inputDelimiter: ",\n\t",
            templateInputs: [
                {
                    type: "template",
                    value: {
                        type: "generic",
                        imports: [],
                        templateString: "{\n\t\t$FERN_INPUT\n\t}",
                        isOptional: true,
                        inputDelimiter: ",\n\t\t",
                        templateInputs: [
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "message: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "message",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "model: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "model",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "preamble: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "preamble",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "chatHistory: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "discriminatedUnion",
                                        imports: [],
                                        isOptional: true,
                                        templateString: "$FERN_INPUT",
                                        discriminantField: "role",
                                        members: {
                                            CHATBOT: {
                                                type: "generic",
                                                imports: [],
                                                templateString:
                                                    '{ \n\t\t\t\trole: "CHATBOT", \n\t\t\t\t$FERN_INPUT\n\t\t\t}',
                                                isOptional: true,
                                                templateInputs: [
                                                    {
                                                        type: "template",
                                                        value: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            inputDelimiter: ",\n\t\t\t\t",
                                                            templateInputs: [
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "generic",
                                                                        imports: [],
                                                                        templateString: "message: $FERN_INPUT",
                                                                        isOptional: true,
                                                                        templateInputs: [
                                                                            {
                                                                                type: "payload",
                                                                                location: "RELATIVE",
                                                                                path: "message",
                                                                            },
                                                                        ],
                                                                        inputDelimiter: undefined,
                                                                    },
                                                                },
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "iterable",
                                                                        imports: [],
                                                                        isOptional: true,
                                                                        containerTemplateString:
                                                                            "toolCalls: [\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t]",
                                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                                        innerTemplate: {
                                                                            type: "generic",
                                                                            imports: [],
                                                                            templateString:
                                                                                "{\n\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t}",
                                                                            isOptional: true,
                                                                            inputDelimiter: ",\n\t\t\t\t\t\t\t",
                                                                            templateInputs: [
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "generic",
                                                                                        imports: [],
                                                                                        templateString:
                                                                                            "name: $FERN_INPUT",
                                                                                        isOptional: true,
                                                                                        templateInputs: [
                                                                                            {
                                                                                                type: "payload",
                                                                                                location: "RELATIVE",
                                                                                                path: "name",
                                                                                            },
                                                                                        ],
                                                                                        inputDelimiter: undefined,
                                                                                    },
                                                                                },
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "dict",
                                                                                        imports: [],
                                                                                        isOptional: true,
                                                                                        containerTemplateString:
                                                                                            "parameters: {\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t}",
                                                                                        delimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        keyValueSeparator: ": ",
                                                                                        keyTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        valueTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        templateInput: {
                                                                                            location: "RELATIVE",
                                                                                            path: "parameters",
                                                                                        },
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        templateInput: {
                                                                            location: "RELATIVE",
                                                                            path: "tool_calls",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                ],
                                                inputDelimiter: undefined,
                                            },
                                            SYSTEM: {
                                                type: "generic",
                                                imports: [],
                                                templateString:
                                                    '{ \n\t\t\t\trole: "SYSTEM", \n\t\t\t\t$FERN_INPUT\n\t\t\t}',
                                                isOptional: true,
                                                templateInputs: [
                                                    {
                                                        type: "template",
                                                        value: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            inputDelimiter: ",\n\t\t\t\t",
                                                            templateInputs: [
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "generic",
                                                                        imports: [],
                                                                        templateString: "message: $FERN_INPUT",
                                                                        isOptional: true,
                                                                        templateInputs: [
                                                                            {
                                                                                type: "payload",
                                                                                location: "RELATIVE",
                                                                                path: "message",
                                                                            },
                                                                        ],
                                                                        inputDelimiter: undefined,
                                                                    },
                                                                },
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "iterable",
                                                                        imports: [],
                                                                        isOptional: true,
                                                                        containerTemplateString:
                                                                            "toolCalls: [\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t]",
                                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                                        innerTemplate: {
                                                                            type: "generic",
                                                                            imports: [],
                                                                            templateString:
                                                                                "{\n\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t}",
                                                                            isOptional: true,
                                                                            inputDelimiter: ",\n\t\t\t\t\t\t\t",
                                                                            templateInputs: [
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "generic",
                                                                                        imports: [],
                                                                                        templateString:
                                                                                            "name: $FERN_INPUT",
                                                                                        isOptional: true,
                                                                                        templateInputs: [
                                                                                            {
                                                                                                type: "payload",
                                                                                                location: "RELATIVE",
                                                                                                path: "name",
                                                                                            },
                                                                                        ],
                                                                                        inputDelimiter: undefined,
                                                                                    },
                                                                                },
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "dict",
                                                                                        imports: [],
                                                                                        isOptional: true,
                                                                                        containerTemplateString:
                                                                                            "parameters: {\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t}",
                                                                                        delimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        keyValueSeparator: ": ",
                                                                                        keyTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        valueTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        templateInput: {
                                                                                            location: "RELATIVE",
                                                                                            path: "parameters",
                                                                                        },
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        templateInput: {
                                                                            location: "RELATIVE",
                                                                            path: "tool_calls",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                ],
                                                inputDelimiter: undefined,
                                            },
                                            USER: {
                                                type: "generic",
                                                imports: [],
                                                templateString:
                                                    '{ \n\t\t\t\trole: "USER", \n\t\t\t\t$FERN_INPUT\n\t\t\t}',
                                                isOptional: true,
                                                templateInputs: [
                                                    {
                                                        type: "template",
                                                        value: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            inputDelimiter: ",\n\t\t\t\t",
                                                            templateInputs: [
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "generic",
                                                                        imports: [],
                                                                        templateString: "message: $FERN_INPUT",
                                                                        isOptional: true,
                                                                        templateInputs: [
                                                                            {
                                                                                type: "payload",
                                                                                location: "RELATIVE",
                                                                                path: "message",
                                                                            },
                                                                        ],
                                                                        inputDelimiter: undefined,
                                                                    },
                                                                },
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "iterable",
                                                                        imports: [],
                                                                        isOptional: true,
                                                                        containerTemplateString:
                                                                            "toolCalls: [\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t]",
                                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                                        innerTemplate: {
                                                                            type: "generic",
                                                                            imports: [],
                                                                            templateString:
                                                                                "{\n\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t}",
                                                                            isOptional: true,
                                                                            inputDelimiter: ",\n\t\t\t\t\t\t\t",
                                                                            templateInputs: [
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "generic",
                                                                                        imports: [],
                                                                                        templateString:
                                                                                            "name: $FERN_INPUT",
                                                                                        isOptional: true,
                                                                                        templateInputs: [
                                                                                            {
                                                                                                type: "payload",
                                                                                                location: "RELATIVE",
                                                                                                path: "name",
                                                                                            },
                                                                                        ],
                                                                                        inputDelimiter: undefined,
                                                                                    },
                                                                                },
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "dict",
                                                                                        imports: [],
                                                                                        isOptional: true,
                                                                                        containerTemplateString:
                                                                                            "parameters: {\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t}",
                                                                                        delimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        keyValueSeparator: ": ",
                                                                                        keyTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        valueTemplate: {
                                                                                            type: "generic",
                                                                                            imports: [],
                                                                                            templateString:
                                                                                                "$FERN_INPUT",
                                                                                            isOptional: true,
                                                                                            templateInputs: [
                                                                                                {
                                                                                                    type: "payload",
                                                                                                    location:
                                                                                                        "RELATIVE",
                                                                                                    path: undefined,
                                                                                                },
                                                                                            ],
                                                                                            inputDelimiter: undefined,
                                                                                        },
                                                                                        templateInput: {
                                                                                            location: "RELATIVE",
                                                                                            path: "parameters",
                                                                                        },
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        templateInput: {
                                                                            location: "RELATIVE",
                                                                            path: "tool_calls",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                ],
                                                inputDelimiter: undefined,
                                            },
                                            TOOL: {
                                                type: "generic",
                                                imports: [],
                                                templateString:
                                                    '{ \n\t\t\t\trole: "TOOL", \n\t\t\t\t$FERN_INPUT\n\t\t\t}',
                                                isOptional: true,
                                                templateInputs: [
                                                    {
                                                        type: "template",
                                                        value: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            inputDelimiter: ",\n\t\t\t\t",
                                                            templateInputs: [
                                                                {
                                                                    type: "template",
                                                                    value: {
                                                                        type: "iterable",
                                                                        imports: [],
                                                                        isOptional: true,
                                                                        containerTemplateString:
                                                                            "toolResults: [\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t]",
                                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                                        innerTemplate: {
                                                                            type: "generic",
                                                                            imports: [],
                                                                            templateString:
                                                                                "{\n\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t}",
                                                                            isOptional: true,
                                                                            inputDelimiter: ",\n\t\t\t\t\t\t\t",
                                                                            templateInputs: [
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "generic",
                                                                                        imports: [],
                                                                                        templateString:
                                                                                            "call: {\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t}",
                                                                                        isOptional: true,
                                                                                        inputDelimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        templateInputs: [
                                                                                            {
                                                                                                type: "template",
                                                                                                value: {
                                                                                                    type: "generic",
                                                                                                    imports: [],
                                                                                                    templateString:
                                                                                                        "name: $FERN_INPUT",
                                                                                                    isOptional: true,
                                                                                                    templateInputs: [
                                                                                                        {
                                                                                                            type: "payload",
                                                                                                            location:
                                                                                                                "RELATIVE",
                                                                                                            path: "call.name",
                                                                                                        },
                                                                                                    ],
                                                                                                    inputDelimiter:
                                                                                                        undefined,
                                                                                                },
                                                                                            },
                                                                                            {
                                                                                                type: "template",
                                                                                                value: {
                                                                                                    type: "dict",
                                                                                                    imports: [],
                                                                                                    isOptional: true,
                                                                                                    containerTemplateString:
                                                                                                        "parameters: {\n\t\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t\t}",
                                                                                                    delimiter:
                                                                                                        ",\n\t\t\t\t\t\t\t\t\t",
                                                                                                    keyValueSeparator:
                                                                                                        ": ",
                                                                                                    keyTemplate: {
                                                                                                        type: "generic",
                                                                                                        imports: [],
                                                                                                        templateString:
                                                                                                            "$FERN_INPUT",
                                                                                                        isOptional:
                                                                                                            true,
                                                                                                        templateInputs:
                                                                                                            [
                                                                                                                {
                                                                                                                    type: "payload",
                                                                                                                    location:
                                                                                                                        "RELATIVE",
                                                                                                                    path: undefined,
                                                                                                                },
                                                                                                            ],
                                                                                                        inputDelimiter:
                                                                                                            undefined,
                                                                                                    },
                                                                                                    valueTemplate: {
                                                                                                        type: "generic",
                                                                                                        imports: [],
                                                                                                        templateString:
                                                                                                            "$FERN_INPUT",
                                                                                                        isOptional:
                                                                                                            true,
                                                                                                        templateInputs:
                                                                                                            [
                                                                                                                {
                                                                                                                    type: "payload",
                                                                                                                    location:
                                                                                                                        "RELATIVE",
                                                                                                                    path: undefined,
                                                                                                                },
                                                                                                            ],
                                                                                                        inputDelimiter:
                                                                                                            undefined,
                                                                                                    },
                                                                                                    templateInput: {
                                                                                                        location:
                                                                                                            "RELATIVE",
                                                                                                        path: "call.parameters",
                                                                                                    },
                                                                                                },
                                                                                            },
                                                                                        ],
                                                                                    },
                                                                                },
                                                                                {
                                                                                    type: "template",
                                                                                    value: {
                                                                                        type: "iterable",
                                                                                        imports: [],
                                                                                        isOptional: true,
                                                                                        containerTemplateString:
                                                                                            "outputs: [\n\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t]",
                                                                                        delimiter:
                                                                                            ",\n\t\t\t\t\t\t\t\t",
                                                                                        innerTemplate: {
                                                                                            type: "dict",
                                                                                            imports: [],
                                                                                            isOptional: true,
                                                                                            containerTemplateString:
                                                                                                "{\n\t\t\t\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t\t\t\t}",
                                                                                            delimiter:
                                                                                                ",\n\t\t\t\t\t\t\t\t\t",
                                                                                            keyValueSeparator: ": ",
                                                                                            keyTemplate: {
                                                                                                type: "generic",
                                                                                                imports: [],
                                                                                                templateString:
                                                                                                    "$FERN_INPUT",
                                                                                                isOptional: true,
                                                                                                templateInputs: [
                                                                                                    {
                                                                                                        type: "payload",
                                                                                                        location:
                                                                                                            "RELATIVE",
                                                                                                        path: undefined,
                                                                                                    },
                                                                                                ],
                                                                                                inputDelimiter:
                                                                                                    undefined,
                                                                                            },
                                                                                            valueTemplate: {
                                                                                                type: "generic",
                                                                                                imports: [],
                                                                                                templateString:
                                                                                                    "$FERN_INPUT",
                                                                                                isOptional: true,
                                                                                                templateInputs: [
                                                                                                    {
                                                                                                        type: "payload",
                                                                                                        location:
                                                                                                            "RELATIVE",
                                                                                                        path: undefined,
                                                                                                    },
                                                                                                ],
                                                                                                inputDelimiter:
                                                                                                    undefined,
                                                                                            },
                                                                                            templateInput: {
                                                                                                location: "RELATIVE",
                                                                                                path: undefined,
                                                                                            },
                                                                                        },
                                                                                        templateInput: {
                                                                                            location: "RELATIVE",
                                                                                            path: "outputs",
                                                                                        },
                                                                                    },
                                                                                },
                                                                            ],
                                                                        },
                                                                        templateInput: {
                                                                            location: "RELATIVE",
                                                                            path: "tool_results",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                ],
                                                inputDelimiter: undefined,
                                            },
                                        },
                                        templateInput: {
                                            location: "RELATIVE",
                                            path: undefined,
                                        },
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "chat_history",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "conversationId: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "conversation_id",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "enum",
                                    imports: [],
                                    isOptional: true,
                                    values: {
                                        OFF: "Cohere.ChatStreamRequestPromptTruncation.Off",
                                        AUTO: "Cohere.ChatStreamRequestPromptTruncation.Auto",
                                        AUTO_PRESERVE_ORDER:
                                            "Cohere.ChatStreamRequestPromptTruncation.AutoPreserveOrder",
                                    },
                                    templateString: "promptTruncation: $FERN_INPUT",
                                    templateInput: {
                                        location: "BODY",
                                        path: "prompt_truncation",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "connectors: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "generic",
                                        imports: [],
                                        templateString: "{\n\t\t\t\t$FERN_INPUT\n\t\t\t}",
                                        isOptional: true,
                                        inputDelimiter: ",\n\t\t\t\t",
                                        templateInputs: [
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "id: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "id",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "userAccessToken: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "user_access_token",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "continueOnFailure: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "continue_on_failure",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "dict",
                                                    imports: [],
                                                    isOptional: true,
                                                    containerTemplateString:
                                                        "options: {\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t}",
                                                    delimiter: ",\n\t\t\t\t\t",
                                                    keyValueSeparator: ": ",
                                                    keyTemplate: {
                                                        type: "generic",
                                                        imports: [],
                                                        templateString: "$FERN_INPUT",
                                                        isOptional: true,
                                                        templateInputs: [
                                                            {
                                                                type: "payload",
                                                                location: "RELATIVE",
                                                                path: undefined,
                                                            },
                                                        ],
                                                        inputDelimiter: undefined,
                                                    },
                                                    valueTemplate: {
                                                        type: "generic",
                                                        imports: [],
                                                        templateString: "$FERN_INPUT",
                                                        isOptional: true,
                                                        templateInputs: [
                                                            {
                                                                type: "payload",
                                                                location: "RELATIVE",
                                                                path: undefined,
                                                            },
                                                        ],
                                                        inputDelimiter: undefined,
                                                    },
                                                    templateInput: {
                                                        location: "RELATIVE",
                                                        path: "options",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "connectors",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "searchQueriesOnly: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "search_queries_only",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "documents: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "dict",
                                        imports: [],
                                        isOptional: true,
                                        containerTemplateString: "{\n\t\t\t\t$FERN_INPUT\n\t\t\t}",
                                        delimiter: ",\n\t\t\t\t",
                                        keyValueSeparator: ": ",
                                        keyTemplate: {
                                            type: "generic",
                                            imports: [],
                                            templateString: "$FERN_INPUT",
                                            isOptional: true,
                                            templateInputs: [
                                                {
                                                    type: "payload",
                                                    location: "RELATIVE",
                                                    path: undefined,
                                                },
                                            ],
                                            inputDelimiter: undefined,
                                        },
                                        valueTemplate: {
                                            type: "generic",
                                            imports: [],
                                            templateString: "$FERN_INPUT",
                                            isOptional: true,
                                            templateInputs: [
                                                {
                                                    type: "payload",
                                                    location: "RELATIVE",
                                                    path: undefined,
                                                },
                                            ],
                                            inputDelimiter: undefined,
                                        },
                                        templateInput: {
                                            location: "RELATIVE",
                                            path: undefined,
                                        },
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "documents",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "enum",
                                    imports: [],
                                    isOptional: true,
                                    values: {
                                        fast: "Cohere.ChatStreamRequestCitationQuality.Fast",
                                        accurate: "Cohere.ChatStreamRequestCitationQuality.Accurate",
                                    },
                                    templateString: "citationQuality: $FERN_INPUT",
                                    templateInput: {
                                        location: "BODY",
                                        path: "citation_quality",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "temperature: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "temperature",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "maxTokens: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "max_tokens",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "maxInputTokens: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "max_input_tokens",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "k: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "k",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "p: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "p",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "seed: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "seed",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "stopSequences: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "generic",
                                        imports: [],
                                        templateString: "$FERN_INPUT",
                                        isOptional: true,
                                        templateInputs: [
                                            {
                                                type: "payload",
                                                location: "RELATIVE",
                                                path: undefined,
                                            },
                                        ],
                                        inputDelimiter: undefined,
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "stop_sequences",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "frequencyPenalty: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "frequency_penalty",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "presencePenalty: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "presence_penalty",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "rawPrompting: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "raw_prompting",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "returnPrompt: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "return_prompt",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "tools: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "generic",
                                        imports: [],
                                        templateString: "{\n\t\t\t\t$FERN_INPUT\n\t\t\t}",
                                        isOptional: true,
                                        inputDelimiter: ",\n\t\t\t\t",
                                        templateInputs: [
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "name: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "name",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "description: $FERN_INPUT",
                                                    isOptional: true,
                                                    templateInputs: [
                                                        {
                                                            type: "payload",
                                                            location: "RELATIVE",
                                                            path: "description",
                                                        },
                                                    ],
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "dict",
                                                    imports: [],
                                                    isOptional: true,
                                                    containerTemplateString:
                                                        "parameterDefinitions: {\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t}",
                                                    delimiter: ",\n\t\t\t\t\t",
                                                    keyValueSeparator: ": ",
                                                    keyTemplate: {
                                                        type: "generic",
                                                        imports: [],
                                                        templateString: "$FERN_INPUT",
                                                        isOptional: true,
                                                        templateInputs: [
                                                            {
                                                                type: "payload",
                                                                location: "RELATIVE",
                                                                path: undefined,
                                                            },
                                                        ],
                                                        inputDelimiter: undefined,
                                                    },
                                                    valueTemplate: {
                                                        type: "generic",
                                                        imports: [],
                                                        templateString: "{\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t}",
                                                        isOptional: true,
                                                        inputDelimiter: ",\n\t\t\t\t\t\t",
                                                        templateInputs: [
                                                            {
                                                                type: "template",
                                                                value: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "description: $FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: "description",
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                            },
                                                            {
                                                                type: "template",
                                                                value: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "type: $FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: "type",
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                            },
                                                            {
                                                                type: "template",
                                                                value: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "required: $FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: "required",
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                            },
                                                        ],
                                                    },
                                                    templateInput: {
                                                        location: "RELATIVE",
                                                        path: "parameter_definitions",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "tools",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "iterable",
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "toolResults: [\n\t\t\t$FERN_INPUT\n\t\t]",
                                    delimiter: ",\n\t\t\t",
                                    innerTemplate: {
                                        type: "generic",
                                        imports: [],
                                        templateString: "{\n\t\t\t\t$FERN_INPUT\n\t\t\t}",
                                        isOptional: true,
                                        inputDelimiter: ",\n\t\t\t\t",
                                        templateInputs: [
                                            {
                                                type: "template",
                                                value: {
                                                    type: "generic",
                                                    imports: [],
                                                    templateString: "call: {\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t}",
                                                    isOptional: true,
                                                    inputDelimiter: ",\n\t\t\t\t\t",
                                                    templateInputs: [
                                                        {
                                                            type: "template",
                                                            value: {
                                                                type: "generic",
                                                                imports: [],
                                                                templateString: "name: $FERN_INPUT",
                                                                isOptional: true,
                                                                templateInputs: [
                                                                    {
                                                                        type: "payload",
                                                                        location: "RELATIVE",
                                                                        path: "call.name",
                                                                    },
                                                                ],
                                                                inputDelimiter: undefined,
                                                            },
                                                        },
                                                        {
                                                            type: "template",
                                                            value: {
                                                                type: "dict",
                                                                imports: [],
                                                                isOptional: true,
                                                                containerTemplateString:
                                                                    "parameters: {\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t}",
                                                                delimiter: ",\n\t\t\t\t\t\t",
                                                                keyValueSeparator: ": ",
                                                                keyTemplate: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "$FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: undefined,
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                                valueTemplate: {
                                                                    type: "generic",
                                                                    imports: [],
                                                                    templateString: "$FERN_INPUT",
                                                                    isOptional: true,
                                                                    templateInputs: [
                                                                        {
                                                                            type: "payload",
                                                                            location: "RELATIVE",
                                                                            path: undefined,
                                                                        },
                                                                    ],
                                                                    inputDelimiter: undefined,
                                                                },
                                                                templateInput: {
                                                                    location: "RELATIVE",
                                                                    path: "call.parameters",
                                                                },
                                                            },
                                                        },
                                                    ],
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    type: "iterable",
                                                    imports: [],
                                                    isOptional: true,
                                                    containerTemplateString:
                                                        "outputs: [\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t]",
                                                    delimiter: ",\n\t\t\t\t\t",
                                                    innerTemplate: {
                                                        type: "dict",
                                                        imports: [],
                                                        isOptional: true,
                                                        containerTemplateString:
                                                            "{\n\t\t\t\t\t\t$FERN_INPUT\n\t\t\t\t\t}",
                                                        delimiter: ",\n\t\t\t\t\t\t",
                                                        keyValueSeparator: ": ",
                                                        keyTemplate: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            templateInputs: [
                                                                {
                                                                    type: "payload",
                                                                    location: "RELATIVE",
                                                                    path: undefined,
                                                                },
                                                            ],
                                                            inputDelimiter: undefined,
                                                        },
                                                        valueTemplate: {
                                                            type: "generic",
                                                            imports: [],
                                                            templateString: "$FERN_INPUT",
                                                            isOptional: true,
                                                            templateInputs: [
                                                                {
                                                                    type: "payload",
                                                                    location: "RELATIVE",
                                                                    path: undefined,
                                                                },
                                                            ],
                                                            inputDelimiter: undefined,
                                                        },
                                                        templateInput: {
                                                            location: "RELATIVE",
                                                            path: undefined,
                                                        },
                                                    },
                                                    templateInput: {
                                                        location: "RELATIVE",
                                                        path: "outputs",
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "tool_results",
                                    },
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    type: "generic",
                                    imports: [],
                                    templateString: "forceSingleStep: $FERN_INPUT",
                                    isOptional: true,
                                    templateInputs: [
                                        {
                                            type: "payload",
                                            location: "BODY",
                                            path: "force_single_step",
                                        },
                                    ],
                                    inputDelimiter: undefined,
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "messages: [\n\t\t$FERN_INPUT\n\t]",
                                    delimiter: ",\n\t\t",
                                    innerTemplate: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "{\n\t\t\t$FERN_INPUT\n\t\t}",
                                        templateInputs: [
                                            {
                                                type: "template",
                                                value: {
                                                    imports: [],
                                                    isOptional: true,
                                                    containerTemplateString:
                                                        '"tool_calls": [\n\t\t\t\t$FERN_INPUT\n\t\t\t]',
                                                    delimiter: ",\n\t\t\t\t",
                                                    innerTemplate: {
                                                        imports: [],
                                                        isOptional: true,
                                                        templateString: "{\n\t\t\t\t\t$FERN_INPUT\n\t\t\t\t}",
                                                        templateInputs: [
                                                            {
                                                                type: "template",
                                                                value: {
                                                                    imports: [],
                                                                    isOptional: true,
                                                                    templateString: '"id": $FERN_INPUT',
                                                                    templateInputs: [
                                                                        {
                                                                            location: "RELATIVE",
                                                                            path: "id",
                                                                            type: "payload",
                                                                        },
                                                                    ],
                                                                    type: "generic",
                                                                    inputDelimiter: undefined,
                                                                },
                                                            },
                                                        ],
                                                        inputDelimiter: ",\n\t\t\t\t\t",
                                                        type: "generic",
                                                    },
                                                    templateInput: {
                                                        location: "RELATIVE",
                                                        path: "tool_calls",
                                                    },
                                                    type: "iterable",
                                                },
                                            },
                                        ],
                                        inputDelimiter: ",\n\t\t\t",
                                        type: "generic",
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "messages",
                                    },
                                    type: "iterable",
                                },
                            },
                        ],
                    },
                },
            ],
        },
        clientInstantiation:
            'const cohere = new CohereClient({ token: "YOUR_TOKEN", clientName: "YOUR_CLIENT_NAME" });',
    },
    apiDefinitionId: undefined,
    additionalTemplates: undefined,
};
