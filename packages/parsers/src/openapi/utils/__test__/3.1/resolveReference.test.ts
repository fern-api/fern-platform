import { OpenAPIV3_1 } from "openapi-types";
import { resolveReference } from "../../3.1/resolveReference";

const defaultOutput = ["out"];

describe("resolveReference", () => {
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

        const result = resolveReference(reference, document, defaultOutput);
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

        const result = resolveReference(reference, document, defaultOutput);
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

        const result = resolveReference(reference, document, defaultOutput);
        expect(result).toEqual(defaultOutput);
    });
});
