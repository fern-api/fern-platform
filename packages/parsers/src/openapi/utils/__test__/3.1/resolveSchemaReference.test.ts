import { OpenAPIV3_1 } from "openapi-types";
import { resolveSchemaReference } from "../../3.1/resolveSchemaReference";

describe("resolveSchemaReference", () => {
    it("should resolve a simple schema reference", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    Pet: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                        },
                    },
                },
            },
        };

        const reference: OpenAPIV3_1.ReferenceObject = {
            $ref: "#/components/schemas/Pet",
        };

        const result = resolveSchemaReference(reference, document);
        expect(result).toEqual({
            type: "object",
            properties: {
                name: { type: "string" },
            },
        });
    });

    it("should handle escaped forward slashes in reference", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {
                    "namespace/type": {
                        type: "string",
                    },
                },
            },
        };

        const reference: OpenAPIV3_1.ReferenceObject = {
            $ref: "#/components/schemas/namespace~1type",
        };

        const result = resolveSchemaReference(reference, document);
        expect(result).toEqual({
            type: "string",
        });
    });

    it("should return unknown type for invalid reference path", () => {
        const document: OpenAPIV3_1.Document = {
            openapi: "3.1.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {},
            components: {
                schemas: {},
            },
        };

        const reference: OpenAPIV3_1.ReferenceObject = {
            $ref: "#/components/schemas/NonExistent",
        };

        const result = resolveSchemaReference(reference, document);
        expect(result).toEqual({
            "x-fern-type": "unknown",
            additionalProperties: true,
        });
    });
});
