import { APIV1Write, FdrAPI, SDKSnippetHolder, transformExampleEndpointCall } from "@fern-api/fdr-sdk";

const EMPTY_SNIPPET_HOLDER = new SDKSnippetHolder({
    snippetsBySdkId: {},
    snippetsConfigWithSdkId: {},
    snippetTemplatesByEndpoint: {},
    snippetsBySdkIdAndEndpointId: {},
    snippetTemplatesByEndpointId: {},
});

describe("transformEndpointEndpointCall", () => {
    it("correctly transforms", () => {
        const endpointDefinition: APIV1Write.EndpointDefinition = {
            id: FdrAPI.EndpointId("endpoint-id"),
            description: "This is some ```markdown```",
            method: APIV1Write.HttpMethod.Post,
            path: {
                parts: [
                    { type: "literal", value: "/prefix" },
                    { type: "pathParameter", value: FdrAPI.PropertyKey("pathParam") },
                    { type: "literal", value: "/suffix" },
                ],
                pathParameters: [
                    {
                        key: FdrAPI.PropertyKey("pathParam"),
                        type: {
                            type: "primitive",
                            value: {
                                type: "string",
                                regex: undefined,
                                minLength: undefined,
                                maxLength: undefined,
                                default: undefined,
                            },
                        },
                        description: undefined,
                        availability: undefined,
                    },
                ],
            },
            queryParameters: [
                {
                    key: "queryParam",
                    type: {
                        type: "primitive",
                        value: { type: "integer", minimum: undefined, maximum: undefined, default: undefined },
                    },
                    description: undefined,
                    availability: undefined,
                },
            ],
            headers: [
                {
                    key: "header",
                    type: {
                        type: "primitive",
                        value: { type: "boolean", default: undefined },
                    },
                    description: undefined,
                    availability: undefined,
                },
            ],
            examples: [],
            auth: undefined,
            defaultEnvironment: undefined,
            environments: undefined,
            originalEndpointId: undefined,
            name: undefined,
            request: undefined,
            response: undefined,
            errors: undefined,
            errorsV2: undefined,
            availability: undefined,
        };

        const transformed = transformExampleEndpointCall({
            endpointDefinition,
            writeShape: {
                path: "/prefix/path-param-value/suffix",
                pathParameters: {
                    [FdrAPI.PropertyKey("pathParam")]: "path-param-value",
                },
                queryParameters: {
                    queryParam: 123,
                },
                headers: {
                    header: true,
                },
                responseStatusCode: 200,
                name: undefined,
                requestBody: undefined,
                requestBodyV3: undefined,
                responseBody: undefined,
                responseBodyV3: undefined,
                codeSamples: undefined,
                description: undefined,
            },
            snippets: EMPTY_SNIPPET_HOLDER,
        });

        expect(transformed).toEqual({
            codeExamples: {
                goSdk: undefined,
                nodeAxios: "",
                pythonSdk: undefined,
                typescriptSdk: undefined,
            },
            codeSamples: [],
            description: undefined,
            name: undefined,
            headers: {
                header: true,
            },
            path: "/prefix/path-param-value/suffix",
            pathParameters: {
                pathParam: "path-param-value",
            },
            queryParameters: {
                queryParam: 123,
            },
            requestBody: undefined,
            requestBodyV3: undefined,
            responseBody: undefined,
            responseBodyV3: undefined,
            responseStatusCode: 200,
        });
    });
});
