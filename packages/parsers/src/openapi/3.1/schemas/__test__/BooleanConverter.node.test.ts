import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { BooleanConverterNode } from "../BooleanConverter.node";

describe("BooleanConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle boolean schema with no default", () => {
            const input: BooleanConverterNode.Input = {
                type: "boolean",
            };
            const node = new BooleanConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.default).toBeUndefined();
        });

        it("should handle boolean schema with valid default", () => {
            const input: BooleanConverterNode.Input = {
                type: "boolean",
                default: true,
            };
            const node = new BooleanConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.default).toBe(true);
        });

        it("should warn when default value is not a boolean", () => {
            const input = {
                type: "boolean",
                default: "not-a-boolean",
            } as BooleanConverterNode.Input;

            new BooleanConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });

            expect(mockContext.errors.warning).toHaveBeenCalledWith({
                message: "The default value for a boolean type should be a boolean",
                path: ["test"],
            });
        });
    });

    describe("convert", () => {
        it("should convert boolean schema without default", () => {
            const input: BooleanConverterNode.Input = {
                type: "boolean",
            };
            const node = new BooleanConverterNode({
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
                        type: "boolean",
                        default: undefined,
                    },
                },
            });
        });

        it("should convert boolean schema with default", () => {
            const input: BooleanConverterNode.Input = {
                type: "boolean",
                default: false,
            };
            const node = new BooleanConverterNode({
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
                        type: "boolean",
                        default: false,
                    },
                },
            });
        });
    });
});
