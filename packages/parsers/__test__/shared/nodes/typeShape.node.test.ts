import { FdrAPI } from "@fern-api/fdr-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../__test__/createMockContext.util";
import { ObjectNode } from "../../../openapi/shared/temporary/v2/object.node";
import { TypeReferenceNode } from "../../../openapi/shared/temporary/v2/typeReference.node";
import { TypeShapeNode } from "../../../openapi/shared/temporary/v2/typeShape.node";
import { SchemaObject } from "../../../openapi/shared/openapi.types";

describe("TypeShapeNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle object schema input", () => {
            const input: SchemaObject = {
                type: "object",
                properties: {},
            };

            const node = new TypeShapeNode(mockContext, input, [], "test");

            expect(node.type).toBe("object");
            expect(node.typeNode).toBeInstanceOf(ObjectNode);
        });

        it("should handle non-object schema input as alias", () => {
            const input: SchemaObject = {
                type: "string",
            };

            const node = new TypeShapeNode(mockContext, input, []);

            expect(node.type).toBe("alias");
            expect(node.typeNode).toBeInstanceOf(TypeReferenceNode);
        });
    });

    describe("toFdrShape", () => {
        it("should output object shape", () => {
            const input: SchemaObject = {
                type: "object",
                properties: {},
            };

            const node = new TypeShapeNode(mockContext, input, []);
            const mockObjectShape: FdrAPI.api.latest.ObjectType = {
                properties: [],
                extends: [],
                extraProperties: undefined,
            };
            vi.spyOn(node.typeNode as ObjectNode, "toFdrShape").mockReturnValue(mockObjectShape);

            const shape = node.toFdrShape();

            expect(shape).toEqual({
                type: "object",
                ...mockObjectShape,
            });
        });

        it("should output alias shape", () => {
            const input: SchemaObject = {
                type: "string",
            };

            const node = new TypeShapeNode(mockContext, input, []);
            const mockTypeReference: FdrAPI.api.latest.TypeReference = {
                type: "primitive",
                value: {
                    type: "string",
                    regex: undefined,
                    minLength: undefined,
                    maxLength: undefined,
                    default: undefined,
                },
            };
            vi.spyOn(node.typeNode as TypeReferenceNode, "toFdrShape").mockReturnValue(mockTypeReference);

            const shape = node.toFdrShape();

            expect(shape).toEqual({
                type: "alias",
                value: mockTypeReference,
            });
        });

        it("should return undefined if typeNode shape is undefined", () => {
            const input: SchemaObject = {
                type: "object",
                properties: {},
            };

            const node = new TypeShapeNode(mockContext, input, []);
            vi.spyOn(node.typeNode as ObjectNode, "toFdrShape").mockReturnValue(undefined);

            expect(node.toFdrShape()).toBeUndefined();
        });

        it("should return undefined if type is undefined", () => {
            const input: SchemaObject = {
                type: "object",
                properties: {},
            };

            const node = new TypeShapeNode(mockContext, input, []);
            node.type = undefined;

            expect(node.toFdrShape()).toBeUndefined();
        });
    });
});
