import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiNodeContext } from "../../../../../openapi/ApiNode";
import { FloatNode } from "../../../../../openapi/shared/temporary/v2/primitives/number/float.node";
import { createMockContext } from "../../../../createMockContext.util";

describe("FloatNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should handle valid number input with float format", () => {
        const input = { type: "number", format: "float" };
        const node = new FloatNode(mockContext, input, []);
        expect(node.type).toBe("double");
        expect(node.toFdrShape()).toEqual({ type: "double" });
        expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
    });

    it("should handle valid number input with double format", () => {
        const input = { type: "number", format: "double" };
        const node = new FloatNode(mockContext, input, []);
        expect(node.type).toBe("double");
        expect(node.toFdrShape()).toEqual({ type: "double" });
        expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
    });

    it("should handle valid number input with no format", () => {
        const input = { type: "number" };
        const node = new FloatNode(mockContext, input, []);
        expect(node.type).toBe("double");
        expect(node.toFdrShape()).toEqual({ type: "double" });
        expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
    });

    it("should handle invalid type", () => {
        const input = { type: "string" };
        const node = new FloatNode(mockContext, input, []);
        expect(node.type).toBeUndefined();
        expect(node.toFdrShape()).toBeUndefined();
        expect(mockContext.errorCollector.addError).toHaveBeenCalledWith(
            'Expected type "number" for numerical primitive, but got "string"',
            [],
            undefined,
        );
    });

    it("should handle invalid format", () => {
        const input = { type: "number", format: "invalid" };
        const node = new FloatNode(mockContext as ApiNodeContext, input, []);
        expect(node.type).toBeUndefined();
        expect(node.toFdrShape()).toBeUndefined();
        expect(mockContext.errorCollector.addError).toHaveBeenCalledWith(
            'Expected format for number primitive, but got "invalid"',
            [],
            undefined,
        );
    });
});
