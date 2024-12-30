import { FernRegistry } from "@fern-fern/fdr-cjs-sdk";
import { SnippetTemplateResolver } from "../../SnippetTemplateResolver";
import { CHAT_COMPLETION_PAYLOAD, CHAT_COMPLETION_SNIPPET } from "../octo";

describe("Snippet Template Resolver", () => {
    it("Test Snippet Template Resolution", async () => {
        // Example with an object, a list of strings, a list of objects, and an enum
        const payload: FernRegistry.CustomSnippetPayload = {
            pathParameters: [{ name: "tune_id", value: "someId" }],
            queryParameters: [
                { name: "offset", value: "10" },
                { name: "output_format", value: "pcm_16000" },
            ],
            requestBody: {
                prompt: "A prompt",
                negative_prompt: "A negative prompt",
                loras: { key1: "value1", key2: "value2" },
                scheduler: "PNDM",
            },
            headers: undefined,
            auth: undefined,
        };

        const samplerTemplate: FernRegistry.TemplateInput = {
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

        const lorasTemplate: FernRegistry.TemplateInput = {
            type: "template",
            value: {
                imports: [],
                type: "dict",
                containerTemplateString: "loras={$FERN_INPUT}",
                delimiter: ", ",
                keyTemplate: {
                    type: "generic",
                    templateString: "$FERN_INPUT",
                    templateInputs: [{ type: "payload", location: "RELATIVE", path: undefined }],
                    isOptional: false,
                    inputDelimiter: undefined,
                    imports: undefined,
                },
                valueTemplate: {
                    type: "generic",
                    templateString: "$FERN_INPUT",
                    templateInputs: [{ type: "payload", location: "RELATIVE", path: undefined }],
                    isOptional: false,
                    inputDelimiter: undefined,
                    imports: undefined,
                },
                keyValueSeparator: ": ",
                templateInput: { location: "BODY", path: "loras" },
                isOptional: true,
            },
        };

        const generateSdxlRequestTemplate: FernRegistry.TemplateInput = {
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
                            inputDelimiter: undefined,
                            imports: undefined,
                        },
                    },
                    {
                        type: "template",
                        value: {
                            type: "generic",
                            templateString: "negative_prompt=$FERN_INPUT",
                            templateInputs: [{ type: "payload", location: "BODY", path: "negative_prompt" }],
                            isOptional: false,
                            inputDelimiter: undefined,
                            imports: undefined,
                        },
                    },
                    {
                        type: "template",
                        value: {
                            imports: [],
                            isOptional: true,
                            templateString: "tune_id=$FERN_INPUT",
                            templateInputs: [
                                {
                                    location: "PATH",
                                    path: "tune_id",
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
                            templateString: "offset=$FERN_INPUT",
                            templateInputs: [
                                {
                                    location: "QUERY",
                                    path: "offset",
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
                            isOptional: false,
                            templateString: "output_format=$FERN_INPUT",
                            values: {
                                mp3_22050_32: '"mp3_22050_32"',
                                mp3_44100_32: '"mp3_44100_32"',
                                mp3_44100_64: '"mp3_44100_64"',
                                mp3_44100_96: '"mp3_44100_96"',
                                mp3_44100_128: '"mp3_44100_128"',
                                mp3_44100_192: '"mp3_44100_192"',
                                pcm_16000: '"pcm_16000"',
                                pcm_22050: '"pcm_22050"',
                                pcm_24000: '"pcm_24000"',
                                pcm_44100: '"pcm_44100"',
                                ulaw_8000: '"ulaw_8000"',
                            },
                            templateInput: {
                                location: "QUERY",
                                path: "output_format",
                            },
                            type: "enum",
                        },
                    },
                    lorasTemplate,
                    samplerTemplate,
                ],
                inputDelimiter: ",\n\t\t",
                isOptional: false,
            },
        };

        const functionInvocationTemplate: FernRegistry.Template = {
            imports: [],
            type: "generic",
            templateString: "client.image_gen.generate_sdxl(\n$FERN_INPUT\n)",
            templateInputs: [generateSdxlRequestTemplate],
            isOptional: false,
            inputDelimiter: undefined,
        };
        const endpointSnippetTemplate: FernRegistry.EndpointSnippetTemplate = {
            sdk: { type: "python", package: "acme", version: "0.0.1" },
            endpointId: {
                path: FernRegistry.EndpointPathLiteral("/image_gen"),
                method: "GET",
                identifierOverride: undefined,
            },
            snippetTemplate: {
                type: "v1",
                clientInstantiation: "from octoai import AsyncAcme\n\nclient = AsyncAcme(api_key='YOUR_API_KEY')",
                functionInvocation: functionInvocationTemplate,
            },
            apiDefinitionId: undefined,
            additionalTemplates: undefined,
        };
        const resolver = new SnippetTemplateResolver({ payload, endpointSnippetTemplate });
        const customSnippet = await resolver.resolveWithFormatting();

        if (customSnippet.type !== "python") {
            throw new Error("Expected snippet to be python");
        }

        expect(customSnippet.sync_client).toMatchSnapshot();
    });

    it("Empty payload", async () => {
        const resolver = new SnippetTemplateResolver({
            payload: {
                headers: undefined,
                pathParameters: undefined,
                queryParameters: undefined,
                requestBody: undefined,
                auth: undefined,
            },
            endpointSnippetTemplate: {
                snippetTemplate: {
                    type: "v1",
                    functionInvocation: {
                        imports: [],
                        isOptional: true,
                        templateString: "await client.voices.get_all(\n\t$FERN_INPUT\n)",
                        templateInputs: [],
                        inputDelimiter: ",\n\t",
                        type: "generic",
                    },
                    clientInstantiation:
                        'from elevenlabs.client import AsyncElevenLabs\n\nclient = AsyncElevenLabs(\n    api_key="YOUR_API_KEY",\n)',
                },
                endpointId: {
                    method: "GET",
                    path: FernRegistry.EndpointPathLiteral("/voices"),
                    identifierOverride: undefined,
                },
                sdk: {
                    type: "python",
                    package: "elevenlabs",
                    version: "0.0.1",
                },
                apiDefinitionId: undefined,
                additionalTemplates: undefined,
            },
        });
        const customSnippet = await resolver.resolveWithFormatting();

        if (customSnippet.type !== "python") {
            throw new Error("Expected snippet to be python");
        }

        expect(customSnippet.sync_client).toMatchSnapshot();
    });

    it("Test Chat Completion snippet", async () => {
        const resolver = new SnippetTemplateResolver({
            payload: CHAT_COMPLETION_PAYLOAD,
            endpointSnippetTemplate: CHAT_COMPLETION_SNIPPET,
        });
        const customSnippet = await resolver.resolveWithFormatting();

        if (customSnippet.type !== "python") {
            throw new Error("Expected snippet to be python");
        }

        expect(customSnippet.sync_client).toMatchSnapshot();
    });
});
