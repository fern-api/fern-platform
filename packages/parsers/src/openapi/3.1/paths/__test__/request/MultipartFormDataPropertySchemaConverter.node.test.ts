import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { MultipartFormDataPropertySchemaConverterNode } from "../../request/MultipartFormDataPropertySchemaConverter.node";

describe("MultipartFormDataPropertySchemaConverterNode", () => {
    const mockContext = createMockContext();

    it("should handle single file upload schema", () => {
        const input = {
            type: "string" as const,
            format: "binary",
            contentMediaType: "image/jpeg",
        };

        const converter = new MultipartFormDataPropertySchemaConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.multipartType).toBe("file");
        expect(converter.contentType).toBe("image/jpeg");
    });

    it("should handle multiple files upload schema", () => {
        const input = {
            type: "array" as const,
            items: {
                type: "string" as const,
                format: "binary",
                contentMediaType: "image/*",
            },
        };

        const converter = new MultipartFormDataPropertySchemaConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.multipartType).toBe("files");
        expect(converter.contentType).toBe("image/*");
    });

    it("should handle regular property schema", () => {
        const input = {
            type: "string" as const,
            contentMediaType: "text/plain",
        };

        const converter = new MultipartFormDataPropertySchemaConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.multipartType).toBe("property");
        expect(converter.contentType).toBe("text/plain");
    });

    it("should handle reference objects", () => {
        const input = {
            $ref: "#/components/schemas/FileUpload",
        } as OpenAPIV3_1.ReferenceObject;

        mockContext.document.components ??= {};
        mockContext.document.components.schemas = {
            FileUpload: {
                type: "string",
                format: "binary",
                contentMediaType: "image/jpeg",
            },
        };

        const converter = new MultipartFormDataPropertySchemaConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.multipartType).toBe("file");
        expect(converter.contentType).toBe("image/jpeg");
    });

    it("should warn and reset types for invalid array items", () => {
        const input = {
            type: "array" as const,
            items: {
                type: "number" as const,
            },
        };

        const converter = new MultipartFormDataPropertySchemaConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        expect(converter.multipartType).toBeUndefined();
        expect(converter.contentType).toBeUndefined();
        expect(mockContext.errors.warning).toHaveBeenCalled();
    });

    it("should convert correctly", () => {
        const input = {
            type: "string" as const,
            format: "binary",
            contentMediaType: "image/jpeg",
        };

        const converter = new MultipartFormDataPropertySchemaConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        const result = converter.convert();
        expect(result).toEqual({
            type: "alias",
            value: { type: "primitive", value: { type: "base64" } },
        });
    });
});
