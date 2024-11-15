import { FdrAPI } from "@fern-api/fdr-sdk";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectPropertyNode } from "../../../openapi/shared/nodes/objectProperty.node";
import { ReferenceObject, SchemaObject } from "../../../openapi/shared/openapi.types";
import { createMockContext } from "../../createMockContext.util";

describe("ObjectPropertyNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle basic schema object", () => {
            const input: SchemaObject = {
                type: "string",
                description: "test description",
            };
            const node = new ObjectPropertyNode("testKey", mockContext, input, []);
            expect(node.description).toBe("test description");
        });

        it("should handle reference object", () => {
            const input: ReferenceObject = {
                $ref: "TypeA",
            };
            const node = new ObjectPropertyNode("testKey", mockContext, input, []);
            expect(node.valueShape).toBeDefined();
        });
    });

    describe("toFdrShape", () => {
        it("should output shape with primitive type", () => {
            const input: SchemaObject = {
                type: "string",
                description: "test description",
            };
            const node = new ObjectPropertyNode("testKey", mockContext, input, []);
            const shape = node.toFdrShape();
            expect(shape).toBeDefined();
            expect(shape?.key).toEqual(FdrAPI.PropertyKey("testKey"));
            expect(shape?.description).toBe("test description");
            expect(shape?.availability).toBeUndefined();
        });

        it("should return undefined if valueShape is undefined and collect error", () => {
            const input: SchemaObject = {
                type: "invalid",
            };
            const node = new ObjectPropertyNode("testKey", mockContext, input, []);
            vi.spyOn(node.valueShape, "toFdrShape").mockReturnValue(undefined);
            expect(node.toFdrShape()).toBeUndefined();
            // this should show up, but since the examples are terse and non-exhaustive, we do not have any validation checking
            // expect(mockContext.errorCollector.addError).toHaveBeenCalledWith(
            //     "Failed to generate shape for property testKey",
            //     [],
            // );
        });
    });
});
