import { FdrAPI } from "@fern-api/fdr-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../__test__/createMockContext.util";
import { NumberNode } from "../../../openapi/shared/nodes/primitives/number.node";
import { StringNode } from "../../../openapi/shared/nodes/primitives/string.node";
import { FdrStringType } from "../../../openapi/shared/nodes/primitives/types/fdr.types";
import { TypeReferenceNode, isReferenceObject } from "../../../openapi/shared/nodes/typeReference.node";
import { ReferenceObject, SchemaObject } from "../../../openapi/shared/openapi.types";

// This will be broken up into multiple tests, but for now, this is a start. We will need to errors for invalid inputs
describe("TypeReferenceNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("isReferenceObject", () => {
        it("should return true for valid reference objects", () => {
            expect(isReferenceObject({ $ref: "TypeA" })).toBe(true);
        });

        it("should return false for non-reference objects", () => {
            expect(isReferenceObject({ type: "string" })).toBe(false);
            expect(isReferenceObject(null)).toBe(false);
            expect(isReferenceObject(undefined)).toBe(false);
            expect(isReferenceObject({ $ref: 123 })).toBe(false);
        });
    });

    describe("constructor", () => {
        it("should handle reference object input", () => {
            const input: ReferenceObject = {
                $ref: "TypeA",
            };

            const node = new TypeReferenceNode(mockContext, input, []);

            expect(node.type).toBe("id");
            expect(node.ref).toBe("TypeA");
            expect(node.default).toBeUndefined();
            expect(node.typeNode).toBeUndefined();
        });

        it("should handle string schema input", () => {
            const input: SchemaObject = {
                type: "string",
            };

            const node = new TypeReferenceNode(mockContext, input, []);

            expect(node.type).toBe("primitive");
            expect(node.ref).toBeUndefined();
            expect(node.typeNode).toBeInstanceOf(StringNode);
        });

        it("should handle number schema input", () => {
            const input: SchemaObject = {
                type: "number",
            };

            const node = new TypeReferenceNode(mockContext, input, []);

            expect(node.type).toBe("primitive");
            expect(node.ref).toBeUndefined();
            expect(node.typeNode).toBeInstanceOf(NumberNode);
        });

        it("should handle integer schema input", () => {
            const input: SchemaObject = {
                type: "integer",
            };

            const node = new TypeReferenceNode(mockContext, input, []);

            expect(node.type).toBe("primitive");
            expect(node.ref).toBeUndefined();
            expect(node.typeNode).toBeInstanceOf(NumberNode);
        });
    });

    describe("outputFdrShape", () => {
        it("should output reference shape", () => {
            const input: ReferenceObject = {
                $ref: "TypeA",
            };

            const node = new TypeReferenceNode(mockContext, input, []);
            const shape = node.outputFdrShape();

            expect(shape).toEqual({
                type: "id",
                id: FdrAPI.TypeId("TypeA"),
                default: undefined,
            });
        });

        it("should output primitive shape", () => {
            const input: SchemaObject = {
                type: "string",
            };

            const node = new TypeReferenceNode(mockContext, input, []);
            const mockPrimitiveShape: FdrStringType = {
                type: "string",
                regex: undefined,
                minLength: undefined,
                maxLength: undefined,
                default: undefined,
            };
            vi.spyOn(node.typeNode as StringNode, "outputFdrShape").mockReturnValue(mockPrimitiveShape);

            const shape = node.outputFdrShape();

            expect(shape).toEqual({
                type: "primitive",
                value: mockPrimitiveShape,
            });
        });

        it("should return undefined if ref is undefined for id type", () => {
            const node = new TypeReferenceNode(mockContext, { $ref: "TypeA" }, []);
            node.ref = undefined;

            expect(node.outputFdrShape()).toBeUndefined();
        });

        it("should return undefined if primitive shape is undefined", () => {
            const input: SchemaObject = {
                type: "string",
            };

            const node = new TypeReferenceNode(mockContext, input, []);
            vi.spyOn(node.typeNode as StringNode, "outputFdrShape").mockReturnValue(undefined);

            expect(node.outputFdrShape()).toBeUndefined();
        });
    });
});
