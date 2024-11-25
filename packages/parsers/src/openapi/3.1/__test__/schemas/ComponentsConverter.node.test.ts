import { FdrAPI } from "@fern-api/fdr-sdk";
import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { ComponentsConverterNode } from "../../schemas/ComponentsConverter.node";

describe("ComponentsConverterNode", () => {
    const mockContext = createMockContext();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should handle empty/null schemas", () => {
        const input: OpenAPIV3_1.ComponentsObject = {};
        const converter = new ComponentsConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.typeSchemas).toBeUndefined();
        expect(mockContext.errors.warning).toHaveBeenCalledWith({
            message: "Expected 'schemas' property to be specified",
            path: ["test"],
        });
    });

    it("should convert schemas correctly", () => {
        const input: OpenAPIV3_1.ComponentsObject = {
            schemas: {
                Pet: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                    },
                },
            },
        };

        const converter = new ComponentsConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });
        expect(converter.typeSchemas).toBeDefined();
        expect(Object.keys(converter.typeSchemas ?? {})).toContain("Pet");
    });

    it("should filter out undefined values in convert()", () => {
        const converter = new ComponentsConverterNode({
            input: {},
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });
        const result = converter.convert();
        expect(result).toBeUndefined();
    });

    it("should use schema name if available, otherwise use key", () => {
        const input: OpenAPIV3_1.ComponentsObject = {
            schemas: {
                user_type: {
                    type: "object",
                    title: "User",
                    properties: {},
                },
            },
        };

        const converter = new ComponentsConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });
        const result = converter.convert() ?? {};

        expect(result).toBeDefined();
        const firstKey = FdrAPI.TypeId(Object.keys(result)[0] ?? "");
        expect(result[firstKey]?.name).toBe("User");
    });
});
