import {
    CustomSnippetPayload,
    EndpointSnippetTemplate,
    PythonSnippet,
    Template,
    TemplateInput,
} from "../../api/generated/api";
import { SnippetTemplateResolver } from "../../controllers/snippets/SnippetTemplateResolver";

describe("Snippet Template Resolver", () => {
    it("Test Snippet Template Resolution", () => {
        // Example with an object, a list of strings, a list of objects, and an enum
        const payload: CustomSnippetPayload = {
            requestBody: {
                prompt: "A prompt",
                negative_prompt: "A negative prompt",
                loras: { key1: "value1", key2: "value2" },
                scheduler: "PNDM",
            },
        };

        const samplerTemplate: TemplateInput = {
            type: "template",
            value: {
                imports: ["from octoai.image_gen import Scheduler"],
                type: "enum",
                values: { PNDM: "OctoAI.myenum.PNDM", LMS: "LMS" },
                templateString: "sampler=$FERN_INPUT",
                templateInput: { location: "BODY", path: "scheduler" },
                isOptional: true,
            },
        };

        const lorasTemplate: TemplateInput = {
            type: "template",
            value: {
                imports: [],
                type: "dict",
                containerTemplateString: "loras={$FERN_INPUT}",
                delimiter: ", ",
                keyTemplate: {
                    type: "generic",
                    templateString: "$FERN_INPUT",
                    templateInputs: [{ type: "payload", location: "RELATIVE" }],
                    isOptional: false,
                },
                valueTemplate: {
                    type: "generic",
                    templateString: "$FERN_INPUT",
                    templateInputs: [{ type: "payload", location: "RELATIVE" }],
                    isOptional: false,
                },
                keyValueSeparator: ": ",
                templateInput: { location: "BODY", path: "loras" },
                isOptional: true,
            },
        };

        const generateSdxlRequestTemplate: TemplateInput = {
            type: "template",
            value: {
                imports: ["from octoai.image_gen import ImageGenerationRequest"],
                type: "generic",
                templateString: "\tImageGenerationRequest(\n\t\t$FERN_INPUT\n\t)",
                templateInputs: [
                    {
                        type: "template",
                        value: {
                            type: "generic",
                            templateString: "prompt=$FERN_INPUT",
                            templateInputs: [{ type: "payload", location: "BODY", path: "prompt" }],
                            isOptional: false,
                        },
                    },
                    {
                        type: "template",
                        value: {
                            type: "generic",
                            templateString: "negative_prompt=$FERN_INPUT",
                            templateInputs: [{ type: "payload", location: "BODY", path: "negative_prompt" }],
                            isOptional: false,
                        },
                    },
                    lorasTemplate,
                    samplerTemplate,
                ],
                inputDelimiter: ",\n\t\t",
                isOptional: false,
            },
        };

        const functionInvocationTemplate: Template = {
            imports: [],
            type: "generic",
            templateString: "client.image_gen.generate_sdxl(\n$FERN_INPUT\n)",
            templateInputs: [generateSdxlRequestTemplate],
            isOptional: false,
        };
        const endpointSnippetTemplate: EndpointSnippetTemplate = {
            sdk: { type: "python", package: "acme", version: "0.0.1" },
            endpointId: { path: "/image_gen", method: "GET" },
            snippetTemplate: {
                type: "v1",
                clientInstantiation: "from octoai import AsyncAcme\n\nclient = AsyncAcme(api_key='YOUR_API_KEY')",
                functionInvocation: functionInvocationTemplate,
            },
        };
        const resolver = new SnippetTemplateResolver({ payload, endpointSnippetTemplate });
        const customSnippet = resolver.resolve();

        expect(customSnippet.type).toEqual("python");
        expect((customSnippet as PythonSnippet).sync_client).toEqual(
            'from octoai.image_gen import ImageGenerationRequest\nfrom octoai.image_gen import Scheduler\n\nfrom octoai import AsyncAcme\n\nclient = AsyncAcme(api_key=\'YOUR_API_KEY\')\nclient.image_gen.generate_sdxl(\n\tImageGenerationRequest(\n\t\tprompt="A prompt",\n\t\tnegative_prompt="A negative prompt",\n\t\tloras={"key1": "value1", "key2": "value2"},\n\t\tsampler=OctoAI.myenum.PNDM\n\t)\n)',
        );
    });

    it("Test Chat Completion snippet", () => {
        const endpointSnippetTemplate: EndpointSnippetTemplate = {
            endpointId: {
                path: "/v1/chat/completions",
                method: "POST",
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
                                            location: "BODY",
                                            path: undefined,
                                            type: "payload",
                                        },
                                    ],
                                    type: "generic",
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
                            },
                        },
                    ],
                    inputDelimiter: ",\n",
                    type: "generic",
                },
                clientInstantiation:
                    'from octoai.client import AsyncOctoAI\n\nclient = AsyncOctoAI(\n    api_key="YOUR_API_KEY",\n)\n',
            },
        };

        const payload: CustomSnippetPayload = {
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
            },
        };

        const resolver = new SnippetTemplateResolver({ payload, endpointSnippetTemplate });
        const customSnippet = resolver.resolve();

        expect(customSnippet.type).toEqual("python");
    });
});
