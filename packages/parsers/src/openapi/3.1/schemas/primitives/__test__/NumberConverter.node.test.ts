import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { OPENAPI_NUMBER_TYPE_FORMAT } from "../../../../types/format.types";
import { NumberConverterNode } from "../NumberConverter.node";

describe("NumberConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle number schema with min/max", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
                minimum: 0.5,
                maximum: 100.5,
            };
            const node = new NumberConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.minimum).toBe(0.5);
            expect(node.maximum).toBe(100.5);
        });

        it("should handle number schema with valid default", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
                default: 42.5,
            };
            const node = new NumberConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.default).toBe(42.5);
        });

        it("should warn when default value is not a number", () => {
            const input = {
                type: "number",
                default: "not-a-number",
            } as NumberConverterNode.Input;

            new NumberConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });

            expect(mockContext.errors.warning).toHaveBeenCalledWith({
                message:
                    "Expected default value to be a number. Received not-a-number",
                path: ["test"],
            });
        });

        describe("format handling", () => {
            it("should warn for invalid format", () => {
                const input: NumberConverterNode.Input = {
                    type: "number",
                    format: "invalid-format",
                };

                new NumberConverterNode({
                    input,
                    context: mockContext,
                    accessPath: [],
                    pathId: "test",
                });

                expect(mockContext.errors.warning).toHaveBeenCalledWith({
                    message: `Expected format to be one of ${OPENAPI_NUMBER_TYPE_FORMAT.join(", ")}. Received invalid-format`,
                    path: ["test"],
                });
            });
        });
    });

    describe("convert", () => {
        it("should convert number schema with all properties", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
                minimum: 0.5,
                maximum: 100.5,
                default: 50.5,
                format: "double",
            };
            const node = new NumberConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.convert()).toEqual({
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "double",
                        minimum: 0.5,
                        maximum: 100.5,
                        default: 50.5,
                    },
                },
            });
        });

        it("should convert basic number schema", () => {
            const input: NumberConverterNode.Input = {
                type: "number",
            };
            const node = new NumberConverterNode({
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            });
            expect(node.convert()).toEqual({
                type: "alias",
                value: {
                    type: "primitive",
                    value: {
                        type: "double",
                        minimum: undefined,
                        maximum: undefined,
                        default: undefined,
                    },
                },
            });
        });
    });
});
