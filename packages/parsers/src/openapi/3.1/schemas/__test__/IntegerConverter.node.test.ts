import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { IntegerConverterNode } from "../IntegerConverter.node";

describe("IntegerConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle integer schema with no properties", () => {
            const input: IntegerConverterNode.Input = {
                type: "integer",
            };
            const node = new IntegerConverterNode(input, mockContext, [], "test");
            expect(node.type).toBe("integer");
            expect(node.minimum).toBeUndefined();
            expect(node.maximum).toBeUndefined();
            expect(node.default).toBeUndefined();
        });

        it("should handle integer schema with min/max", () => {
            const input: IntegerConverterNode.Input = {
                type: "integer",
                minimum: 0,
                maximum: 100,
            };
            const node = new IntegerConverterNode(input, mockContext, [], "test");
            expect(node.minimum).toBe(0);
            expect(node.maximum).toBe(100);
        });

        it("should handle integer schema with valid default", () => {
            const input: IntegerConverterNode.Input = {
                type: "integer",
                default: 42,
            };
            const node = new IntegerConverterNode(input, mockContext, [], "test");
            expect(node.default).toBe(42);
        });

        it("should warn when default value is not a number", () => {
            const input = {
                type: "integer",
                default: "not-a-number",
            } as IntegerConverterNode.Input;

            new IntegerConverterNode(input, mockContext, [], "test");

            expect(mockContext.errors.warning).toHaveBeenCalledWith({
                message: "The default value for an integer type should be an integer",
                path: ["test"],
            });
        });

        describe("format handling", () => {
            it("should set type to long for int64 format", () => {
                const input: IntegerConverterNode.Input = {
                    type: "integer",
                    format: "int64",
                };
                const node = new IntegerConverterNode(input, mockContext, [], "test");
                expect(node.type).toBe("long");
            });

            it("should keep type as integer for other valid formats", () => {
                const validFormats = ["int8", "int16", "int32", "uint8", "sf-integer"];

                validFormats.forEach((format) => {
                    const input: IntegerConverterNode.Input = {
                        type: "integer",
                        format,
                    };
                    const node = new IntegerConverterNode(input, mockContext, [], "test");
                    expect(node.type).toBe("integer");
                });
            });

            it("should warn for invalid format", () => {
                const input: IntegerConverterNode.Input = {
                    type: "integer",
                    format: "invalid-format",
                };

                new IntegerConverterNode(input, mockContext, [], "test");

                expect(mockContext.errors.warning).toHaveBeenCalledWith({
                    message: "The format for an integer type should be int64, int8, int16, int32, uint8, or sf-integer",
                    path: ["test"],
                });
            });
        });
    });

    describe("convert", () => {
        it("should convert integer schema with all properties", () => {
            const input: IntegerConverterNode.Input = {
                type: "integer",
                minimum: 0,
                maximum: 100,
                default: 50,
                format: "int64",
            };
            const node = new IntegerConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toEqual({
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "long",
                        minimum: 0,
                        maximum: 100,
                        default: 50,
                    },
                },
            });
        });

        it("should convert basic integer schema", () => {
            const input: IntegerConverterNode.Input = {
                type: "integer",
            };
            const node = new IntegerConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toEqual({
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "integer",
                        minimum: undefined,
                        maximum: undefined,
                        default: undefined,
                    },
                },
            });
        });
    });
});
