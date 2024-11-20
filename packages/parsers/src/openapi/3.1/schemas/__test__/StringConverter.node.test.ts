import { describe, expect, it } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { StringConverterNode } from "../StringConverter.node";

describe("StringConverterNode", () => {
    const mockContext = createMockContext();

    describe("constructor", () => {
        it("should initialize with default string type", () => {
            const input: StringConverterNode.Input = { type: "string" };
            const node = new StringConverterNode(input, mockContext, [], "test");
            expect(node.type).toBe("string");
        });

        it("should handle default value", () => {
            const input: StringConverterNode.Input = {
                type: "string",
                default: "test-default",
            };
            const node = new StringConverterNode(input, mockContext, [], "test");
            expect(node.default).toBe("test-default");
        });

        it("should warn on invalid default value", () => {
            const input = {
                type: "string",
                default: 123,
            } as const;
            new StringConverterNode(input, mockContext, [], "test");
            expect(mockContext.errors.warning).toHaveBeenCalledWith({
                message: "The default value for an string type should be an string",
                path: ["test"],
            });
        });
    });

    describe("mapToFdrType", () => {
        it("should map base64 formats correctly", () => {
            const input: StringConverterNode.Input = {
                type: "string",
                format: "base64url",
            };
            const node = new StringConverterNode(input, mockContext, [], "test");
            expect(node.type).toBe("base64");
        });

        it("should map date-time format correctly", () => {
            const input: StringConverterNode.Input = {
                type: "string",
                format: "date-time",
            };
            const node = new StringConverterNode(input, mockContext, [], "test");
            expect(node.type).toBe("datetime");
        });

        it("should map uuid format correctly", () => {
            const input: StringConverterNode.Input = {
                type: "string",
                format: "uuid",
            };
            const node = new StringConverterNode(input, mockContext, [], "test");
            expect(node.type).toBe("uuid");
        });

        it("should default to string for standard string formats", () => {
            const input: StringConverterNode.Input = {
                type: "string",
                format: "email",
            };
            const node = new StringConverterNode(input, mockContext, [], "test");
            expect(node.type).toBe("string");
        });

        it("should warn on invalid format", () => {
            const input = {
                type: "string",
                format: "invalid-format",
            } as const;
            new StringConverterNode(input, mockContext, [], "test");
            expect(mockContext.errors.warning).toHaveBeenCalled();
        });
    });

    describe("convert", () => {
        it("should return correct FdrStringType", () => {
            const input: StringConverterNode.Input = {
                type: "string",
                format: "uuid",
                default: "test-default",
            };
            const node = new StringConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toEqual({
                type: "uuid",
                regex: undefined,
                minLength: undefined,
                maxLength: undefined,
                default: "test-default",
            });
        });
    });
});
