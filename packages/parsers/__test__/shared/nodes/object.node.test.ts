import { FdrAPI } from "@fern-api/fdr-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectNode } from "../../../openapi/shared/temporary/v2/object.node";
import { SchemaObject } from "../../../openapi/shared/openapi.types";
import { createMockContext } from "../../createMockContext.util";

describe("ObjectNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle object with no properties or extends", () => {
            const input: SchemaObject = {
                type: "object",
            };
            const node = new ObjectNode(mockContext, input, []);
            expect(node.properties).toEqual([]);
            expect(node.extends).toEqual([]);
            expect(node.extraProperties).toBeUndefined();
        });

        it("should handle object with properties", () => {
            const input: SchemaObject = {
                type: "object",
                properties: {
                    name: { type: "string" },
                    age: { type: "integer" },
                },
            };
            const node = new ObjectNode(mockContext, input, []);
            expect(node.properties).toHaveLength(2);
        });

        it("should handle object with allOf/extends", () => {
            const input: SchemaObject = {
                type: "object",
                allOf: [{ $ref: "TypeA" }, { $ref: "TypeB" }],
            };
            const node = new ObjectNode(mockContext, input, []);
            // This needs to change to the computed generated type id for FDR
            expect(node.extends).toEqual([FdrAPI.TypeId("TypeA"), FdrAPI.TypeId("TypeB")]);
        });

        it("should filter out non-reference allOf items", () => {
            const input: SchemaObject = {
                type: "object",
                allOf: [{ $ref: "TypeA" }, { type: "object" }],
            };
            const node = new ObjectNode(mockContext, input, []);
            expect(node.extends).toEqual([FdrAPI.TypeId("TypeA")]);
        });
    });

    describe("toFdrShape", () => {
        it("should output shape with no properties", () => {
            const node = new ObjectNode(mockContext, { type: "object" }, []);
            expect(node.toFdrShape()).toEqual({
                extends: [],
                properties: [],
                extraProperties: undefined,
            });
        });

        it("should output shape with multiple properties and extends", () => {
            const input: SchemaObject = {
                type: "object",
                properties: {
                    firstName: { type: "string" },
                    lastName: { type: "string" },
                    age: { type: "integer" },
                    height: { type: "number" },
                    id: { type: "string" },
                    score: { type: "number" },
                },
                allOf: [{ $ref: "BaseType" }, { $ref: "PersonType" }],
            };
            const node = new ObjectNode(mockContext, input, []);
            const shape = node.toFdrShape();
            expect(shape?.extends).toEqual([FdrAPI.TypeId("BaseType"), FdrAPI.TypeId("PersonType")]);
            expect(shape?.properties).toHaveLength(6);
            expect(shape?.extraProperties).toBeUndefined();
        });
    });
});
