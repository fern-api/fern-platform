import { expect } from "vitest";

import { beforeEach, describe, it, vi } from "vitest";
import { NumberNode } from "../../../../openapi/shared/temporary/v2/primitives/number.node";
import { FloatNode } from "../../../../openapi/shared/temporary/v2/primitives/number/float.node";
import { IntegerNode } from "../../../../openapi/shared/temporary/v2/primitives/number/integer.node";
import { createMockContext } from "../../../createMockContext.util";

describe("NumberNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle valid integer input", () => {
            const input = {
                type: "integer",
                minimum: 1,
                maximum: 10,
                default: 5,
            };
            const node = new NumberNode(mockContext, input, []);
            expect(node.typeNode).toBeInstanceOf(IntegerNode);
            expect(node.minimum).toBe(1);
            expect(node.maximum).toBe(10);
            expect(node.default).toBe(5);
            expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
        });

        it("should handle valid number input", () => {
            const input = {
                type: "number",
                minimum: 1.5,
                maximum: 10.5,
                default: 5.5,
            };
            const node = new NumberNode(mockContext, input, []);
            expect(node.typeNode).toBeInstanceOf(FloatNode);
            expect(node.minimum).toBe(1.5);
            expect(node.maximum).toBe(10.5);
            expect(node.default).toBe(5.5);
            expect(mockContext.errorCollector.addError).not.toHaveBeenCalled();
        });

        it("should handle invalid type", () => {
            const input = { type: "string" };
            const node = new NumberNode(mockContext, input, []);
            expect(node.typeNode).toBeUndefined();
            expect(mockContext.errorCollector.addError).toHaveBeenCalledWith(
                'Expected type "integer" or "number" for numerical primitive, but got "string"',
                [],
                undefined,
            );
        });
    });

    describe("toFdrShape", () => {
        it("should return undefined when typeNode shape is undefined", () => {
            const input = { type: "string" };
            const node = new NumberNode(mockContext, input, []);
            expect(node.toFdrShape()).toBeUndefined();
        });

        it("should return complete shape for integer type", () => {
            const input = {
                type: "integer",
                minimum: 1,
                maximum: 10,
                default: 5,
            };
            const node = new NumberNode(mockContext, input, []);
            const shape = node.toFdrShape();
            expect(shape).toEqual({
                type: "integer",
                minimum: 1,
                maximum: 10,
                default: 5,
            });
        });

        it("should return complete shape for number type", () => {
            const input = {
                type: "number",
                minimum: 1.5,
                maximum: 10.5,
                default: 5.5,
            };
            const node = new NumberNode(mockContext, input, []);
            const shape = node.toFdrShape();
            expect(shape).toEqual({
                type: "double",
                minimum: 1.5,
                maximum: 10.5,
                default: 5.5,
            });
        });
    });
});
