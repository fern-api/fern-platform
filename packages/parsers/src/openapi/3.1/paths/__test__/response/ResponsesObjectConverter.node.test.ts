import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { ReferenceConverterNode } from "../../../schemas/ReferenceConverter.node";
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

        expect(converter.contentType).toBe("application/json");
        expect(converter.schema).toBeDefined();
    });

    it("should handle application/octet-stream content type", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {
            schema: {
                type: "object",
                required: ["data"],
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

        expect(converter.contentType).toBe("application/octet-stream");
        expect(converter.isOptional).toBe(false);
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

        expect(converter.contentType).toBe("multipart/form-data");
        expect(converter.fields).toBeDefined();
        expect(converter.requiredFields).toContain("file");
    });

    it("should handle reference objects", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {
            schema: {
                $ref: "#/components/schemas/Request",
            },
        };

        mockContext.document.components ??= {};
        mockContext.document.components.schemas = {
            Request: {
                type: "object",
                properties: {
                    data: { type: "string" },
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

        expect(converter.schema).toBeDefined();
        expect(converter.schema instanceof ReferenceConverterNode).toBe(true);
    });

    it("should warn when schema is missing", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {};

        new RequestMediaTypeObjectConverterNode(
            {
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            },
            "application/json",
        );

        expect(mockContext.errors.warning).toHaveBeenCalledWith({
            message: expect.stringContaining("Expected media type schema"),
            path: ["test"],
        });
    });

    it("should warn for unsupported content types", () => {
        const input: OpenAPIV3_1.MediaTypeObject = {
            schema: {
                type: "object",
            },
        };

        new RequestMediaTypeObjectConverterNode(
            {
                input,
                context: mockContext,
                accessPath: [],
                pathId: "test",
            },
            "text/plain",
        );

        expect(mockContext.errors.warning).toHaveBeenCalledWith({
            message: expect.stringContaining("Expected request body"),
            path: ["test"],
        });
    });
});
