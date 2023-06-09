import { transformExampleEndpointCall } from "../../services/api/registerToDbConversion/transformApiDefinitionToDb";
import { FernRegistry } from "../generated";

describe("transformEndpointEndpointCall", () => {
    it("correctly transforms", () => {
        const endpointDefinition: FernRegistry.api.v1.register.EndpointDefinition = {
            id: "endpoint-id",
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
            responseBody: undefined,
            responseStatusCode: 200,
        });
    });
});
