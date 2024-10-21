import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";

export const CHAT_COMPLETION_SNIPPET: FernRegistry.EndpointSnippetTemplate = {
    endpointId: {
        path: FernRegistry.EndpointPathLiteral("/v1/chat/completions"),
        method: "POST",
        identifierOverride: undefined,
    },
    sdk: {
        type: "python",
        package: "octoai",
        version: "0.0.5",
    },
    snippetTemplate: {
        type: "v1",
        functionInvocation: {
            imports: [],
            isOptional: true,
            templateString: "await client.text_gen.create_chat_completion_stream(\n$FERN_INPUT\n)",
            templateInputs: [
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "frequency_penalty=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "frequency_penalty",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        containerTemplateString: "functions=[$FERN_INPUT]",
                        delimiter: ", ",
                        innerTemplate: {
                            imports: ["from .function import Function"],
                            isOptional: true,
                            templateString: "Function($FERN_INPUT)",
                            templateInputs: [
                                {
                                    type: "template",
                                    value: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "description=$FERN_INPUT",
                                        templateInputs: [
                                            {
                                                location: "BODY",
                                                path: "description",
                                                type: "payload",
                                            },
                                        ],
                                        type: "generic",
                                        inputDelimiter: undefined,
                                    },
                                },
                                {
                                    type: "template",
                                    value: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "name=$FERN_INPUT",
                                        templateInputs: [
                                            {
                                                location: "BODY",
                                                path: "name",
                                                type: "payload",
                                            },
                                        ],
                                        type: "generic",
                                        inputDelimiter: undefined,
                                    },
                                },
                                {
                                    type: "template",
                                    value: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "parameters=$FERN_INPUT",
                                        templateInputs: [
                                            {
                                                location: "BODY",
                                                path: "parameters",
                                                type: "payload",
                                            },
                                        ],
                                        type: "generic",
                                        inputDelimiter: undefined,
                                    },
                                },
                            ],
                            inputDelimiter: ",\n",
                            type: "generic",
                        },
                        templateInput: {
                            location: "BODY",
                            path: "functions",
                        },
                        type: "iterable",
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "ignore_eos=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "ignore_eos",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        containerTemplateString: "logit_bias={$FERN_INPUT}",
                        delimiter: ", ",
                        keyTemplate: {
                            imports: [],
                            isOptional: true,
                            templateString: "$FERN_INPUT",
                            templateInputs: [
                                {
                                    location: "RELATIVE",
                                    path: undefined,
                                    type: "payload",
                                },
                            ],
                            type: "generic",
                            inputDelimiter: undefined,
                        },
                        valueTemplate: {
                            imports: [],
                            isOptional: true,
                            templateString: "$FERN_INPUT",
                            templateInputs: [
                                {
                                    location: "RELATIVE",
                                    path: undefined,
                                    type: "payload",
                                },
                            ],
                            type: "generic",
                            inputDelimiter: undefined,
                        },
                        keyValueSeparator: ": ",
                        templateInput: {
                            location: "BODY",
                            path: "logit_bias",
                        },
                        type: "dict",
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "max_tokens=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "max_tokens",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        containerTemplateString: "messages=[$FERN_INPUT]",
                        delimiter: ", ",
                        innerTemplate: {
                            imports: ["from .chat_message import ChatMessage"],
                            isOptional: true,
                            templateString: "ChatMessage($FERN_INPUT)",
                            templateInputs: [
                                {
                                    type: "template",
                                    value: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "content=$FERN_INPUT",
                                        templateInputs: [
                                            {
                                                location: "BODY",
                                                path: "content",
                                                type: "payload",
                                            },
                                        ],
                                        type: "generic",
                                        inputDelimiter: undefined,
                                    },
                                },
                                {
                                    type: "template",
                                    value: {
                                        imports: ["from .chat_fn_call import ChatFnCall"],
                                        isOptional: true,
                                        templateString: "function_call=ChatFnCall(\n$FERN_INPUT\n)",
                                        templateInputs: [
                                            {
                                                type: "template",
                                                value: {
                                                    imports: [],
                                                    isOptional: true,
                                                    templateString: "arguments=$FERN_INPUT",
                                                    templateInputs: [
                                                        {
                                                            location: "BODY",
                                                            path: "function_call.arguments",
                                                            type: "payload",
                                                        },
                                                    ],
                                                    type: "generic",
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                            {
                                                type: "template",
                                                value: {
                                                    imports: [],
                                                    isOptional: true,
                                                    templateString: "name=$FERN_INPUT",
                                                    templateInputs: [
                                                        {
                                                            location: "BODY",
                                                            path: "function_call.name",
                                                            type: "payload",
                                                        },
                                                    ],
                                                    type: "generic",
                                                    inputDelimiter: undefined,
                                                },
                                            },
                                        ],
                                        inputDelimiter: ",\n",
                                        type: "generic",
                                    },
                                },
                                {
                                    type: "template",
                                    value: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "role=$FERN_INPUT",
                                        templateInputs: [
                                            {
                                                location: "BODY",
                                                path: "role",
                                                type: "payload",
                                            },
                                        ],
                                        type: "generic",
                                        inputDelimiter: undefined,
                                    },
                                },
                            ],
                            inputDelimiter: ",\n",
                            type: "generic",
                        },
                        templateInput: {
                            location: "BODY",
                            path: "messages",
                        },
                        type: "iterable",
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "model=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "model",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "n=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "n",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: ["from .chat_completion_request_ext import ChatCompletionRequestExt"],
                        isOptional: true,
                        templateString: "octoai=ChatCompletionRequestExt(\n$FERN_INPUT\n)",
                        templateInputs: [
                            {
                                type: "template",
                                value: {
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "loras=[$FERN_INPUT]",
                                    delimiter: ", ",
                                    innerTemplate: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "$FERN_INPUT",
                                        templateInputs: [
                                            {
                                                location: "BODY",
                                                path: undefined,
                                                type: "payload",
                                            },
                                        ],
                                        type: "generic",
                                        inputDelimiter: undefined,
                                    },
                                    templateInput: {
                                        location: "BODY",
                                        path: "octoai.loras",
                                    },
                                    type: "iterable",
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    imports: [
                                        "from .chat_completion_request_ext_vllm import ChatCompletionRequestExtVllm",
                                    ],
                                    isOptional: true,
                                    templateString: "vllm=ChatCompletionRequestExtVllm(\n$FERN_INPUT\n)",
                                    templateInputs: [
                                        {
                                            type: "template",
                                            value: {
                                                imports: [],
                                                isOptional: true,
                                                templateString: "best_of=$FERN_INPUT",
                                                templateInputs: [
                                                    {
                                                        location: "BODY",
                                                        path: "octoai.vllm.best_of",
                                                        type: "payload",
                                                    },
                                                ],
                                                type: "generic",
                                                inputDelimiter: undefined,
                                            },
                                        },
                                        {
                                            type: "template",
                                            value: {
                                                imports: [],
                                                isOptional: true,
                                                templateString: "ignore_eos=$FERN_INPUT",
                                                templateInputs: [
                                                    {
                                                        location: "BODY",
                                                        path: "octoai.vllm.best_of.vllm.ignore_eos",
                                                        type: "payload",
                                                    },
                                                ],
                                                type: "generic",
                                                inputDelimiter: undefined,
                                            },
                                        },
                                        {
                                            type: "template",
                                            value: {
                                                imports: [],
                                                isOptional: true,
                                                templateString: "skip_special_tokens=$FERN_INPUT",
                                                templateInputs: [
                                                    {
                                                        location: "BODY",
                                                        path: "octoai.vllm.best_of.vllm.ignore_eos.vllm.skip_special_tokens",
                                                        type: "payload",
                                                    },
                                                ],
                                                type: "generic",
                                                inputDelimiter: undefined,
                                            },
                                        },
                                        {
                                            type: "template",
                                            value: {
                                                imports: [],
                                                isOptional: true,
                                                containerTemplateString: "stop_token_ids=[$FERN_INPUT]",
                                                delimiter: ", ",
                                                innerTemplate: {
                                                    imports: [],
                                                    isOptional: true,
                                                    templateString: "$FERN_INPUT",
                                                    templateInputs: [
                                                        {
                                                            location: "BODY",
                                                            path: undefined,
                                                            type: "payload",
                                                        },
                                                    ],
                                                    type: "generic",
                                                    inputDelimiter: undefined,
                                                },
                                                templateInput: {
                                                    location: "BODY",
                                                    path: "octoai.vllm.best_of.vllm.ignore_eos.vllm.skip_special_tokens.vllm.stop_token_ids",
                                                },
                                                type: "iterable",
                                            },
                                        },
                                        {
                                            type: "template",
                                            value: {
                                                imports: [],
                                                isOptional: true,
                                                templateString: "top_k=$FERN_INPUT",
                                                templateInputs: [
                                                    {
                                                        location: "BODY",
                                                        path: "octoai.vllm.best_of.vllm.ignore_eos.vllm.skip_special_tokens.vllm.stop_token_ids.vllm.top_k",
                                                        type: "payload",
                                                    },
                                                ],
                                                type: "generic",
                                                inputDelimiter: undefined,
                                            },
                                        },
                                        {
                                            type: "template",
                                            value: {
                                                imports: [],
                                                isOptional: true,
                                                templateString: "use_beam_search=$FERN_INPUT",
                                                templateInputs: [
                                                    {
                                                        location: "BODY",
                                                        path: "octoai.vllm.best_of.vllm.ignore_eos.vllm.skip_special_tokens.vllm.stop_token_ids.vllm.top_k.vllm.use_beam_search",
                                                        type: "payload",
                                                    },
                                                ],
                                                type: "generic",
                                                inputDelimiter: undefined,
                                            },
                                        },
                                    ],
                                    inputDelimiter: ",\n",
                                    type: "generic",
                                },
                            },
                        ],
                        inputDelimiter: ",\n",
                        type: "generic",
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "presence_penalty=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "presence_penalty",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "repetition_penalty=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "repetition_penalty",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: ["from .chat_completion_response_format import ChatCompletionResponseFormat"],
                        isOptional: true,
                        templateString: "response_format=ChatCompletionResponseFormat(\n$FERN_INPUT\n)",
                        templateInputs: [
                            {
                                type: "template",
                                value: {
                                    imports: [],
                                    isOptional: true,
                                    containerTemplateString: "schema={$FERN_INPUT}",
                                    delimiter: ", ",
                                    keyTemplate: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "$FERN_INPUT",
                                        templateInputs: [
                                            {
                                                location: "BODY",
                                                path: undefined,
                                                type: "payload",
                                            },
                                        ],
                                        type: "generic",
                                        inputDelimiter: undefined,
                                    },
                                    valueTemplate: {
                                        imports: [],
                                        isOptional: true,
                                        templateString: "$FERN_INPUT",
                                        templateInputs: [
                                            {
                                                location: "BODY",
                                                path: undefined,
                                                type: "payload",
                                            },
                                        ],
                                        type: "generic",
                                        inputDelimiter: undefined,
                                    },
                                    keyValueSeparator: ": ",
                                    templateInput: {
                                        location: "BODY",
                                        path: "response_format.schema",
                                    },
                                    type: "dict",
                                },
                            },
                            {
                                type: "template",
                                value: {
                                    imports: [],
                                    isOptional: true,
                                    templateString: "type=$FERN_INPUT",
                                    templateInputs: [
                                        {
                                            location: "BODY",
                                            path: "response_format.type",
                                            type: "payload",
                                        },
                                    ],
                                    type: "generic",
                                    inputDelimiter: undefined,
                                },
                            },
                        ],
                        inputDelimiter: ",\n",
                        type: "generic",
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "temperature=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "temperature",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "top_p=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "top_p",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
                {
                    type: "template",
                    value: {
                        imports: [],
                        isOptional: true,
                        templateString: "user=$FERN_INPUT",
                        templateInputs: [
                            {
                                location: "BODY",
                                path: "user",
                                type: "payload",
                            },
                        ],
                        type: "generic",
                        inputDelimiter: undefined,
                    },
                },
            ],
            inputDelimiter: ",\n",
            type: "generic",
        },
        clientInstantiation:
            'from octoai.client import AsyncOctoAI\n\nclient = AsyncOctoAI(\n    api_key="YOUR_API_KEY",\n)\n',
    },
    apiDefinitionId: undefined,
    additionalTemplates: undefined,
};

export const CHAT_COMPLETION_PAYLOAD: FernRegistry.CustomSnippetPayload = {
    headers: [],
    pathParameters: [],
    queryParameters: [],
    requestBody: {
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant.",
            },
            {
                role: "user",
                content: "Hello world",
            },
        ],
        model: "qwen1.5-32b-chat",
        max_tokens: 512,
        presence_penalty: 0,
        temperature: 0.1,
        top_p: 0.9,
        logit_bias: { "": undefined },
    },
    auth: undefined,
};
