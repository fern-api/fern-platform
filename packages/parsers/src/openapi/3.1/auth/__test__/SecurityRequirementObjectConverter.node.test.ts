import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { SecurityRequirementObjectConverterNode } from "../SecurityRequirementObjectConverter.node";

describe("SecurityRequirementObjectConverterNode", () => {
    const mockContext = createMockContext();

    it("should parse security requirements with header auth", () => {
        const input = [
            {
                apiKey: [],
            },
        ];

        const mockDocument = {
            components: {
                securitySchemes: {
                    apiKey: {
                        type: "apiKey",
                        in: "header",
                        name: "Authorization",
                        "x-fern-header": {
                            name: "customHeader",
                            prefix: "Bearer",
                        },
                    },
                },
            },
        } as unknown as OpenAPIV3_1.Document;

        const node = new SecurityRequirementObjectConverterNode({
            input,
            context: {
                ...mockContext,
                document: mockDocument,
            },
            accessPath: [],
            pathId: "test",
        });

        const converted = node.convert();
        expect(converted).toEqual({
            apiKey: {
                headerWireValue: "Authorization",
                type: "header",
                nameOverride: "customHeader",
                prefix: "Bearer",
            },
        });
    });

    it("should handle missing security scheme", () => {
        const input = [
            {
                missingScheme: [],
            },
        ];

        const mockDocument = {
            components: {
                securitySchemes: {},
            },
        } as unknown as OpenAPIV3_1.Document;

        const node = new SecurityRequirementObjectConverterNode({
            input,
            context: {
                ...mockContext,
                document: mockDocument,
            },
            accessPath: [],
            pathId: "test",
        });

        const converted = node.convert();
        expect(converted).toEqual({});
    });

    it("should handle multiple security schemes", () => {
        const input = [
            {
                apiKey1: [],
                apiKey2: [],
            },
        ];

        const mockDocument = {
            components: {
                securitySchemes: {
                    apiKey1: {
                        type: "apiKey",
                        in: "header",
                        name: "Authorization1",
                        "x-fern-header": {
                            name: "customHeader1",
                            prefix: "Bearer",
                        },
                    },
                    apiKey2: {
                        type: "apiKey",
                        in: "header",
                        name: "Authorization2",
                        "x-fern-header": {
                            name: "customHeader2",
                            prefix: "Basic",
                        },
                    },
                },
            },
        } as unknown as OpenAPIV3_1.Document;

        const node = new SecurityRequirementObjectConverterNode({
            input,
            context: {
                ...mockContext,
                document: mockDocument,
            },
            accessPath: [],
            pathId: "test",
        });

        const converted = node.convert();
        expect(converted).toEqual({
            apiKey1: {
                headerWireValue: "Authorization1",
                type: "header",
                nameOverride: "customHeader1",
                prefix: "Bearer",
            },
            apiKey2: {
                headerWireValue: "Authorization2",
                type: "header",
                nameOverride: "customHeader2",
                prefix: "Basic",
            },
        });
    });

    it("should filter out null converted values", () => {
        const input = [
            {
                validKey: [],
                invalidKey: [],
            },
        ];

        const mockDocument = {
            components: {
                securitySchemes: {
                    validKey: {
                        type: "apiKey",
                        in: "header",
                        name: "Authorization",
                        "x-fern-header": {
                            name: "customHeader",
                            prefix: "Bearer",
                        },
                    },
                    invalidKey: {
                        type: "invalid",
                    },
                },
            },
        } as unknown as OpenAPIV3_1.Document;

        const node = new SecurityRequirementObjectConverterNode({
            input,
            context: {
                ...mockContext,
                document: mockDocument,
            },
            accessPath: [],
            pathId: "test",
        });

        const converted = node.convert();
        expect(converted).toEqual({
            validKey: {
                headerWireValue: "Authorization",
                type: "header",
                nameOverride: "customHeader",
                prefix: "Bearer",
            },
        });
    });
});
