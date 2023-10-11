import { SDKSnippetHolder } from "../../converters/db/snippets/SDKSnippetHolder";
import { APIV1Write } from "../../api";
import { transformExampleEndpointCall } from "../../converters/db/convertAPIDefinitionToDb";

const EMPTY_SNIPPET_HOLDER = new SDKSnippetHolder({
    snippetsBySdkId: {},
    sdkIdToPackage: {},
    snippetsConfiguration: {},
});

describe("transformEndpointEndpointCall", () => {
    it("correctly transforms", () => {
        const endpointDefinition: APIV1Write.EndpointDefinition = {
            id: "endpoint-id",
            description: "This is some ```markdown```",
            method: APIV1Write.HttpMethod.Post,
            path: {
                parts: [
                    { type: "literal", value: "/prefix" },
                    { type: "pathParameter", value: "pathParam" },
                    { type: "literal", value: "/suffix" },
                ],
                pathParameters: [
                    {
                        key: "pathParam",
                        type: {
                            type: "primitive",
                            value: { type: "string" },
                        },
                    },
                ],
            },
            queryParameters: [
                {
                    key: "queryParam",
                    type: {
                        type: "primitive",
                        value: { type: "integer" },
                    },
                },
            ],
            headers: [
                {
                    key: "header",
                    type: {
                        type: "primitive",
                        value: { type: "boolean" },
                    },
                },
            ],
            examples: [],
        };

        const transformed = transformExampleEndpointCall({
            endpointDefinition,
            writeShape: {
                path: "/prefix/path-param-value/suffix",
                pathParameters: {
                    pathParam: "path-param-value",
                },
                queryParameters: {
                    queryParam: 123,
                },
                headers: {
                    header: true,
                },
                responseStatusCode: 200,
            },
            snippets: EMPTY_SNIPPET_HOLDER,
        });

        expect(transformed).toEqual({
            codeExamples: {
                nodeAxios: "",
            },
            description: undefined,
            descriptionContainsMarkdown: false,
            htmlDescription: undefined,
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
            requestBodyV2: undefined,
            responseBody: undefined,
            responseBodyV2: undefined,
            responseStatusCode: 200,
        });
    });
});
