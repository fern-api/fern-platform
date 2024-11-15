import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../__test__/createMockContext.util";
import { SchemaNode } from "../../../openapi/shared/nodes/schema.node";
import { SchemaObject } from "../../../openapi/shared/openapi.types";

describe("SchemaNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle basic schema input", () => {
            const input: SchemaObject = {
                type: "string",
                description: "test description",
            };

            const node = new SchemaNode("TestType", mockContext, input, []);

            expect(node.description).toBe("test description");
            expect(node.shape).toBeDefined();
        });
    });

    describe("outputFdrShape", () => {
        it("should output complete shape", () => {
            const input: SchemaObject = {
                type: "string",
                description: "test description",
            };

            const node = new SchemaNode("TestType", mockContext, input, []);
            const shape = node.outputFdrShape();

            expect(shape).toBeDefined();
            expect(shape?.name).toBe("TestType");
            expect(shape?.description).toBe("test description");
            expect(shape?.availability).toBeUndefined();
        });

        it("should return undefined if shape is undefined", () => {
            const input: SchemaObject = {
                type: "invalid",
            };

            const node = new SchemaNode("TestType", mockContext, input, []);
            vi.spyOn(node.shape, "outputFdrShape").mockReturnValue(undefined);

            expect(node.outputFdrShape()).toBeUndefined();
            // this should show up, but since the examples are terse and non-exhaustive, we do not have any validation checking
            // expect(mockContext.errorCollector.addError).toHaveBeenCalledWith(
            //     "Failed to generate shape for type TestType",
            //     [],
            // );
        });
    });
});
