import { OpenAPIV3_1 } from "openapi-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { ArrayConverterNode } from "../ArrayConverter.node";
import { StringConverterNode } from "../StringConverter.node";

describe("ArrayConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle array with items schema", () => {
            const input: ArrayConverterNode.Input = {
                type: "array",
                items: { type: "string" },
            };
            const node = new ArrayConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.innerSchema?.typeShapeNode).toBeInstanceOf(StringConverterNode);
        });

        it("should error when items is null", () => {
            const input = {
                type: "array",
            } as ArrayConverterNode.Input;
            new ArrayConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(mockContext.errors.error).toHaveBeenCalledWith({
                message: "Error converting node. Please contact support if the error persists.",
                path: ["test", "items"],
            });
        });
    });

    describe("convert", () => {
        it("should convert array of strings", () => {
            const input: ArrayConverterNode.Input = {
                type: "array",
                items: { type: "string" },
            };
            const node = new ArrayConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            const converted = node.convert();
            expect(converted).toEqual({
                type: "alias",
                value: {
                    type: "list",
                    itemShape: {
                        type: "alias",
                        value: {
                            type: "primitive",
                            value: {
                                type: "string",
                            },
                        },
                    },
                },
            });
        });

        it("should return undefined if inner schema conversion fails", () => {
            const input: ArrayConverterNode.Input = {
                type: "array",
                items: { type: "invalid" as OpenAPIV3_1.NonArraySchemaObjectType },
            };
            const node = new ArrayConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            const converted = node.convert();
            expect(mockContext.errors.error).toHaveBeenCalledWith({
                message: "No type shape node found",
                path: ["test", "items"],
            });
            expect(converted).toBeUndefined();
        });
    });
});
