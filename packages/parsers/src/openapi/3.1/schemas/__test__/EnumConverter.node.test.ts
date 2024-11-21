import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { EnumConverterNode } from "../EnumConverter.node";

describe("EnumConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle enum schema with no values", () => {
            const input: EnumConverterNode.Input = {
                type: "object",
            };
            const node = new EnumConverterNode(input, mockContext, [], "test");
            expect(node.values).toEqual([]);
            expect(node.default).toBeUndefined();
        });

        it("should handle enum schema with valid string values", () => {
            const input: EnumConverterNode.Input = {
                type: "object",
                enum: ["ONE", "TWO", "THREE"],
            };
            const node = new EnumConverterNode(input, mockContext, [], "test");
            expect(node.values).toEqual(["ONE", "TWO", "THREE"]);
        });

        it("should deduplicate enum values", () => {
            const input: EnumConverterNode.Input = {
                type: "object",
                enum: ["ONE", "TWO", "ONE", "THREE"],
            };
            const node = new EnumConverterNode(input, mockContext, [], "test");
            expect(node.values).toEqual(["ONE", "TWO", "THREE"]);
        });

        it("should error when enum values are not strings", () => {
            const input = {
                type: "object",
                enum: ["ONE", 2, "THREE"],
            } as EnumConverterNode.Input;

            new EnumConverterNode(input, mockContext, [], "test");

            expect(mockContext.errors.error).toHaveBeenCalledWith({
                message: "The values in an enum type should be strings",
                path: ["test"],
            });
        });
    });

    describe("convert", () => {
        it("should convert enum schema with values", () => {
            const input: EnumConverterNode.Input = {
                type: "object",
                enum: ["ONE", "TWO"],
                default: "ONE",
            };
            const node = new EnumConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toEqual({
                type: "enum",
                values: [
                    { value: "ONE", description: undefined, availability: undefined },
                    { value: "TWO", description: undefined, availability: undefined },
                ],
                default: "ONE",
            });
        });

        it("should convert empty enum schema", () => {
            const input: EnumConverterNode.Input = {
                type: "object",
            };
            const node = new EnumConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toEqual({
                type: "enum",
                values: [],
                default: undefined,
            });
        });
    });
});
