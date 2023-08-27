import { transformExampleEndpointCall } from "../../controllers/api/registerToDbConversion/transformApiDefinitionToDb";
import { FernRegistry } from "../generated";

describe("transformEndpointEndpointCall", () => {
    it("correctly transforms", () => {
        const endpointDefinition: FernRegistry.api.v1.register.EndpointDefinition = {
            id: "endpoint-id",
            description: "This is some ```markdown```",
            method: FernRegistry.api.v1.register.HttpMethod.Post,
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
