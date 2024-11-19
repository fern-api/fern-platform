import { OpenAPIV3_1 } from "openapi-types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { ReferenceConverterNode } from "../ReferenceConverter.node";

describe("ReferenceConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("constructor", () => {
        it("should handle valid reference", () => {
            const input: OpenAPIV3_1.ReferenceObject = {
                $ref: "#/components/schemas/Pet",
            };
            const node = new ReferenceConverterNode(input, mockContext, [], "test");
            expect(node.schemaId).toBe("Pet");
        });

        it("should handle invalid reference", () => {
            const input: OpenAPIV3_1.ReferenceObject = {
                $ref: "invalid-ref",
            };
            const node = new ReferenceConverterNode(input, mockContext, [], "test");
            expect(node.schemaId).toBeUndefined();
            expect(mockContext.errors.error).toHaveBeenCalledWith({
                message: "Unprocessable reference: invalid-ref",
                path: [],
            });
        });
    });

    describe("convert", () => {
        it("should convert valid reference", () => {
            const input: OpenAPIV3_1.ReferenceObject = {
                $ref: "#/components/schemas/Pet",
            };
            const node = new ReferenceConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toEqual({
                type: "alias",
                value: {
                    type: "id",
                    id: "Pet",
                    default: undefined,
                },
            });
        });

        it("should return undefined for invalid reference", () => {
            const input: OpenAPIV3_1.ReferenceObject = {
                $ref: "invalid-ref",
            };
            const node = new ReferenceConverterNode(input, mockContext, [], "test");
            expect(node.convert()).toBeUndefined();
        });
    });
});
