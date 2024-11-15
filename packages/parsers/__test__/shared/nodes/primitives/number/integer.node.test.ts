import { beforeEach, describe, expect, it, vi } from "vitest";
import { IntegerNode } from "../../../../../openapi/shared/nodes/primitives/number/integer.node";
import { createMockContext } from "../../../../createMockContext.util";

describe("IntegerNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should handle valid integer input with int32 format", () => {
        const input = { type: "integer", format: "int32" };
        const node = new IntegerNode(mockContext, input, []);
        expect(node.type).toBe("integer");
        expect(node.toFdrShape()).toEqual({ type: "integer" });
        expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
    });

    it("should handle valid integer input with int64 format", () => {
        const input = { type: "integer", format: "int64" };
        const node = new IntegerNode(mockContext, input, []);
        expect(node.type).toBe("long");
        expect(node.toFdrShape()).toEqual({ type: "long" });
        expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
    });

    it("should handle valid integer input with no format", () => {
        const input = { type: "integer" };
        const node = new IntegerNode(mockContext, input, []);
        expect(node.type).toBe("integer");
        expect(node.toFdrShape()).toEqual({ type: "integer" });
        expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
    });

    it("should handle invalid type", () => {
        const input = { type: "string" };
        const node = new IntegerNode(mockContext, input, []);
        expect(node.type).toBe("integer"); // Default value
        expect(node.toFdrShape()).toEqual({ type: "integer" });
        expect(mockContext.errorCollector.addError).toHaveBeenCalledWith(
            'Expected type "integer" for numerical primitive, but got "string"',
            [],
            undefined,
        );
    });

    it("should handle invalid format", () => {
        const input = { type: "integer", format: "invalid" };
        const node = new IntegerNode(mockContext, input, []);
        expect(node.type).toBe("integer"); // Default value
        expect(node.toFdrShape()).toEqual({ type: "integer" });
        expect(mockContext.errorCollector.addError).toHaveBeenCalledWith(
            'Expected format for integer primitive, but got "invalid"',
            [],
            undefined,
        );
    });

    it("should handle other valid integer formats", () => {
        const formats = ["int8", "int16", "uint8", "sf-integer"];
        formats.forEach((format) => {
            const input = { type: "integer", format };
            const node = new IntegerNode(mockContext, input, []);
            expect(node.type).toBe("integer");
            expect(node.toFdrShape()).toEqual({ type: "integer" });
            expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
        });
    });
});
