import { createMockContext } from "../../../../__test__/createMockContext.util";
import { OneOfConverterNode } from "../OneOfConverter.node";

describe("OneOfConverterNode", () => {
    const mockContext = createMockContext({
        openapi: "3.1.0",
        info: {
            title: "Test",
            version: "1.0.0",
        },
        components: {
            schemas: {
                Dog: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                    },
                },
            },
        },
    });

    describe("constructor", () => {
        it("handles undiscriminated oneOf", () => {
            const input: OneOfConverterNode.Input = {
                type: "object",
                oneOf: [
                    { type: "object", properties: { a: { type: "string" } } },
                    { type: "object", properties: { b: { type: "string" } } },
                ],
            };
            const node = new OneOfConverterNode(input, mockContext, [], "test");
            expect(node.discriminated).toBe(false);
            expect(node.undiscriminatedMapping?.length).toBe(2);
        });

        it("handles discriminated oneOf", () => {
            const input: OneOfConverterNode.Input = {
                type: "object",
                oneOf: [{ $ref: "#/components/schemas/Dog" }],
                discriminator: {
                    propertyName: "type",
                    mapping: {
                        dog: "#/components/schemas/Dog",
                    },
                },
            };
            const node = new OneOfConverterNode(input, mockContext, [], "test");
            expect(node.discriminated).toBe(true);
            expect(node.discriminant).toBe("type");
            expect(Object.keys(node.discriminatedMapping || {})).toContain("dog");
        });
    });

    describe("convert", () => {
        it("converts discriminated union", () => {
            const input: OneOfConverterNode.Input = {
                type: "object",
                oneOf: [{ $ref: "#/components/schemas/Dog" }],
                discriminator: {
                    propertyName: "type",
                    mapping: {
                        dog: "#/components/schemas/Dog",
                    },
                },
            };
            const node = new OneOfConverterNode(input, mockContext, [], "test");
            const result = node.convert();
            expect(result?.type).toBe("discriminatedUnion");
            expect(result?.variants.length).toEqual(1);
        });

        it("converts undiscriminated union", () => {
            const input: OneOfConverterNode.Input = {
                type: "object",
                oneOf: [
                    { type: "object", properties: { a: { type: "string" } } },
                    { type: "object", properties: { b: { type: "string" } } },
                ],
            };
            const node = new OneOfConverterNode(input, mockContext, [], "test");
            const result = node.convert();
            expect(result?.type).toBe("undiscriminatedUnion");
            expect(result).toEqual({
                type: "undiscriminatedUnion",
                variants: [
                    {
                        shape: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    key: "a",
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
                    },
                    {
                        shape: {
                            type: "object",
                            extends: [],
                            properties: [
                                {
                                    key: "b",
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
                    },
                ],
            });
        });

        it("returns undefined for invalid state", () => {
            const input: OneOfConverterNode.Input = {
                type: "object",
            };
            const node = new OneOfConverterNode(input, mockContext, [], "test");
            const result = node.convert();
            expect(result).toBeUndefined();
        });
    });
});
