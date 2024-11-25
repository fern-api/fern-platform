import { OpenAPIV3_1 } from "openapi-types";
import { describe, expect, it } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { PathsObjectConverterNode } from "../../paths/PathsObjectConverter.node";

describe("PathsObjectConverterNode", () => {
    const mockContext = createMockContext();

    describe("convert", () => {
        it("should convert paths object with multiple paths", () => {
            const input: OpenAPIV3_1.PathsObject = {
                "/pets": {
                    get: {
                        description: "List pets",
                        responses: {
                            "200": {
                                description: "List of pets",
                            },
                        },
                    },
                },
                "/pets/{petId}": {
                    get: {
                        description: "Get a pet",
                        parameters: [
                            {
                                name: "petId",
                                in: "path",
                                schema: { type: "string" },
                            },
                        ],
                        responses: {
                            "200": {
                                description: "A pet",
                            },
                        },
                    },
                },
            };

            const node = new PathsObjectConverterNode(
                {
                    input,
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                },
                undefined,
            );

            const result = node.convert() ?? {};

            expect(result).toBeDefined();
            expect(Object.keys(result)).toHaveLength(2);
            Object.values(result).forEach((endpoint) => {
                expect(endpoint).toEqual(
                    expect.objectContaining({
                        method: "GET",
                    }),
                );
            });
        });

        it("should handle empty paths object", () => {
            const input: OpenAPIV3_1.PathsObject = {};

            const node = new PathsObjectConverterNode(
                {
                    input,
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                },
                undefined,
            );

            const result = node.convert();
            expect(result).toEqual({});
        });

        it("should handle null path items", () => {
            const input: OpenAPIV3_1.PathsObject = {
                "/test": undefined,
            };

            const node = new PathsObjectConverterNode(
                {
                    input,
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                },
                undefined,
            );

            const result = node.convert();
            expect(result).toEqual({});
        });

        it("should handle paths with servers", () => {
            const mockServer: OpenAPIV3_1.ServerObject = {
                url: "https://api.example.com",
            };

            const input: OpenAPIV3_1.PathsObject = {
                "/test": {
                    servers: [mockServer],
                    get: {
                        description: "Test endpoint",
                        responses: {
                            "200": {
                                description: "Success",
                            },
                        },
                    },
                },
            };

            const node = new PathsObjectConverterNode(
                {
                    input,
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                },
                undefined,
            );

            const result = node.convert() ?? {};
            expect(result).toBeDefined();
            expect(Object.keys(result)).toHaveLength(1);
        });
    });
});
