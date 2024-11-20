import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { NumberConverterNode } from "../NumberConverter.node";

describe("NumberConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle number schema with no properties", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
            };
            const node = new NumberConverterNode(input, mockContext, [], "test");
            expect(node.type).toBe("double");
            expect(node.minimum).toBeUndefined();
            expect(node.maximum).toBeUndefined();
            expect(node.default).toBeUndefined();
        });

        it("should handle number schema with min/max", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
                minimum: 0.5,
                maximum: 100.5,
            };
            const node = new NumberConverterNode(input, mockContext, [], "test");
            expect(node.minimum).toBe(0.5);
            expect(node.maximum).toBe(100.5);
        });

        it("should handle number schema with valid default", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
                default: 42.5,
            };
            const node = new NumberConverterNode(input, mockContext, [], "test");
            expect(node.default).toBe(42.5);
        });

        it("should warn when default value is not a number", () => {
            const input = {
                type: "number",
                default: "not-a-number",
            } as NumberConverterNode.Input;

            new NumberConverterNode(input, mockContext, [], "test");

            expect(mockContext.errors.warning).toHaveBeenCalledWith({
                message: "The default value for an number type should be an number",
                path: ["test"],
            });
        });

        describe("format handling", () => {
            it("should handle decimal format", () => {
                const input: NumberConverterNode.Input = {
                    type: "number",
                    format: "decimal",
                };
                const node = new NumberConverterNode(input, mockContext, [], "test");
                expect(node.type).toBe("double");
            });

            it("should warn for invalid format", () => {
                const input: NumberConverterNode.Input = {
                    type: "number",
                    format: "invalid-format",
                };

                new NumberConverterNode(input, mockContext, [], "test");

                expect(mockContext.errors.warning).toHaveBeenCalledWith({
                    message: "The format for an number type should be int64, int8, int16, int32, uint8, or sf-number",
                    path: ["test"],
                });
            });
        });
    });

    describe("convert", () => {
        it("should convert number schema with all properties", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
                minimum: 0.5,
                maximum: 100.5,
                default: 50.5,
                format: "double",
            };
            const node = new NumberConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toEqual({
                type: "double",
                minimum: 0.5,
                maximum: 100.5,
                default: 50.5,
            });
        });

        it("should convert basic number schema", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
            };
            const node = new NumberConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toEqual({
                type: "double",
                minimum: undefined,
                maximum: undefined,
                default: undefined,
            });
        });
    });
});
