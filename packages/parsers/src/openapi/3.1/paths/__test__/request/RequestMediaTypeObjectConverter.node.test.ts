import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { RequestMediaTypeObjectConverterNode } from "../../request/RequestMediaTypeObjectConverter.node";

describe("RequestMediaTypeObjectConverterNode", () => {
    const mockContext = createMockContext();

    it("should handle application/json content type", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {
            schema: {
                type: "object",
                properties: {
                    name: { type: "string" },
                },
            },
        };

        const converter = new RequestMediaTypeObjectConverterNode(
            {
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            },
            "application/json",
        );

        expect(converter.contentType).toBe("json");
        expect(converter.schema).toBeDefined();
    });

    it("should handle application/octet-stream content type", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {
            schema: {
                type: "object",
            },
        };

        const converter = new RequestMediaTypeObjectConverterNode(
            {
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            },
            "application/octet-stream",
        );

        expect(converter.contentType).toBe("stream");
        expect(converter.isOptional).toBe(true);
    });

    it("should handle multipart/form-data content type", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {
            schema: {
                type: "object",
                properties: {
                    file: {
                        type: "string",
                        format: "binary",
                    },
                },
                required: ["file"],
            },
        };

        const converter = new RequestMediaTypeObjectConverterNode(
            {
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            },
            "multipart/form-data",
        );

        expect(converter.contentType).toBe("form-data");
        expect(converter.fields).toBeDefined();
        expect(converter.requiredFields).toEqual(["file"]);
    });

    it("should handle reference objects", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {
            schema: {
                $ref: "#/components/schemas/Pet",
            },
        };

        mockContext.document.components ??= {};
        mockContext.document.components.schemas = {
            Pet: { type: "object" },
        };

        const converter = new RequestMediaTypeObjectConverterNode(
            {
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            },
            "application/json",
        );

        expect(converter.schema).toBeDefined();
    });

    it("should handle missing schema", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {};

        const converter = new RequestMediaTypeObjectConverterNode(
            {
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            },
            "application/json",
        );

        expect(converter.schema).toBeUndefined();
        expect(mockContext.errors.warning).toHaveBeenCalled();
    });

    it("should handle unsupported content types", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {
            schema: {
                type: "object",
            },
        };

        const converter = new RequestMediaTypeObjectConverterNode(
            {
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            },
            "application/xml",
        );

        expect(converter.contentType).toBeUndefined();
        expect(mockContext.errors.warning).toHaveBeenCalled();
    });
});
