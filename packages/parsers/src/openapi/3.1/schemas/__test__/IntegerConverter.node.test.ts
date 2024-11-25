import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { OPENAPI_INTEGER_TYPE_FORMAT } from "../../../types/format.types";
import { IntegerConverterNode } from "../IntegerConverter.node";

describe("IntegerConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle integer schema with min/max", () => {
            const input: IntegerConverterNode.Input = {
                type: "integer",
                minimum: 0,
                maximum: 100,
            };
            const node = new IntegerConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.minimum).toBe(0);
            expect(node.maximum).toBe(100);
        });

        it("should handle integer schema with valid default", () => {
            const input: IntegerConverterNode.Input = {
                type: "integer",
                default: 42,
            };
            const node = new IntegerConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.default).toBe(42);
        });

        it("should warn when default value is not a number", () => {
            const input = {
                type: "integer",
                default: "not-an-integer",
            } as IntegerConverterNode.Input;

            new IntegerConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });

            expect(mockContext.errors.warning).toHaveBeenCalledWith({
                message: "Expected default value to be an integer. Received not-an-integer",
                path: ["test"],
            });
        });

        describe("format handling", () => {
            it("should warn for invalid format", () => {
                const input: IntegerConverterNode.Input = {
                    type: "integer",
                    format: "invalid-format",
                };

                new IntegerConverterNode({
                    input,
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                });

                expect(mockContext.errors.warning).toHaveBeenCalledWith({
                    message: `Expected format to be one of ${OPENAPI_INTEGER_TYPE_FORMAT.join(", ")}. Received invalid-format`,
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
            const node = new IntegerConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
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
            const node = new IntegerConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
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
