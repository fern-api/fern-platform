import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { RequestBodyObjectConverterNode } from "../../request/RequestBodyObjectConverter.node";

describe("RequestBodyObjectConverterNode", () => {
    const mockContext = createMockContext();

    it("should handle reference objects", () => {
        const input = {
            $ref: "#/components/requestBodies/PetBody",
        };

        mockContext.document.components ??= {};
        mockContext.document.components.requestBodies = {
            PetBody: {
                content: {
                    "application/json": { schema: { type: "object" } },
                },
            },
        };

        const converter = new RequestBodyObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.requestBodiesByContentType).toBeDefined();
    });

    it("should handle request body objects with content", () => {
        const input = {
            content: {
                "application/json": {
                    schema: {
                        type: "object" as const,
                        properties: {
                            name: { type: "string" as const },
                        },
                    },
                },
            },
        };

        const converter = new RequestBodyObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.requestBodiesByContentType).toBeDefined();
        expect(
            converter.requestBodiesByContentType?.["application/json"]
        ).toBeDefined();
    });

    it("should handle multiple content types", () => {
        const input = {
            content: {
                "application/json": {
                    schema: { type: "object" as const },
                },
                "application/xml": {
                    schema: { type: "object" as const },
                },
            },
        };

        const converter = new RequestBodyObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(
            Object.keys(converter.requestBodiesByContentType ?? {})
        ).toHaveLength(2);
    });

    it("should convert to HttpRequest array", () => {
        const input = {
            description: "Pet object",
            content: {
                "application/json": {
                    schema: {
                        type: "object" as const,
                        properties: {
                            name: { type: "string" as const },
                        },
                    },
                },
            },
        };

        const converter = new RequestBodyObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        const result = converter.convert();
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            contentType: "application/json",
            body: {
                type: "object",
                extends: [],
                properties: [
                    {
                        key: "name",
                        valueShape: {
                            type: "alias",
                            value: {
                                type: "primitive",
                                value: {
                                    type: "string",
                                },
                            },
                        },
                    },
                ],
            },
        });
    });

    it("should handle null request body", () => {
        const input = null as unknown as OpenAPIV3_1.RequestBodyObject;

        const converter = new RequestBodyObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.requestBodiesByContentType).toBeUndefined();
        expect(converter.convert()).toEqual([]);
    });
});
