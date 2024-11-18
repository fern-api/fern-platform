import { expect, it } from "vitest";

import { beforeEach, describe, vi } from "vitest";
import { StringNode } from "../../../../openapi/shared/temporary/v2/primitives/string.node";
import { SchemaObject } from "../../../../openapi/shared/openapi.types";
import { createMockContext } from "../../../createMockContext.util";

describe("StringNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle valid string input", () => {
            const input: SchemaObject = {
                type: "string",
                format: "date-time",
                pattern: "^test$",
                default: "default",
                minLength: 1,
                maxLength: 10,
            };

            const node = new StringNode(mockContext, input, []);

            expect(node.type).toBe("datetime");
            expect(node.regex).toBe("^test$");
            expect(node.default).toBe("default");
            expect(node.minLength).toBe(1);
            expect(node.maxLength).toBe(10);
        });

        it("should handle invalid type", () => {
            const input = {
                type: "number",
            } as SchemaObject;

            new StringNode(mockContext, input, []);

            expect(mockContext.errorCollector.addError).toHaveBeenCalledWith(
                'Expected type "string" for primitive, but got "number"',
                [],
                undefined,
            );
        });
    });

    describe("mapToFdrType", () => {
        let node: StringNode;

        beforeEach(() => {
            node = new StringNode(mockContext, { type: "string" }, []);
        });

        it("should map base64 formats correctly", () => {
            expect(node.mapToFdrType("base64url")).toBe("base64");
            expect(node.mapToFdrType("binary")).toBe("base64");
            expect(node.mapToFdrType("byte")).toBe("base64");
        });

        it("should map date formats correctly", () => {
            expect(node.mapToFdrType("date-time")).toBe("datetime");
            expect(node.mapToFdrType("date")).toBe("date");
        });

        it("should map other special formats correctly", () => {
            expect(node.mapToFdrType("int64")).toBe("bigInteger");
            expect(node.mapToFdrType("uuid")).toBe("uuid");
        });

        it("should default to string for common formats", () => {
            expect(node.mapToFdrType("email")).toBe("string");
            expect(node.mapToFdrType("uri")).toBe("string");
            expect(node.mapToFdrType(undefined)).toBe("string");
        });
    });

    describe("toFdrShape", () => {
        it("should return undefined when type is undefined", () => {
            const node = new StringNode(mockContext, { type: "string" }, []);
            node.type = undefined;
            expect(node.toFdrShape()).toBeUndefined();
        });

        it("should return complete shape with all properties", () => {
            const node = new StringNode(
                mockContext,
                {
                    type: "string",
                    format: "date-time",
                    pattern: "^test$",
                    default: "default",
                    minLength: 1,
                    maxLength: 10,
                },
                [],
            );

            expect(node.toFdrShape()).toEqual({
                type: "datetime",
                regex: "^test$",
                default: "default",
                minLength: 1,
                maxLength: 10,
            });
        });
    });
});
