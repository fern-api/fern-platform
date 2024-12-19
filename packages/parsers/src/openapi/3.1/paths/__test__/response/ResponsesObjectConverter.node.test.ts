import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { ResponsesObjectConverterNode } from "../../response/ResponsesObjectConverter.node";

describe("ResponsesObjectConverterNode", () => {
    const mockContext = createMockContext();

    it("should handle success responses", () => {
        const input: OpenAPIV3_1.ResponsesObject = {
            "200": {
                description: "Success response",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                data: { type: "string" },
                            },
                        },
                    },
                },
            },
        };

        const converter = new ResponsesObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        const result = converter.convert();
        expect(result?.responses).toBeDefined();
        expect(result?.responses[0]?.response.statusCode).toBe(200);
        expect(result?.responses[0]?.response.description).toBe(
            "Success response"
        );
    });

    it("should handle error responses", () => {
        const input: OpenAPIV3_1.ResponsesObject = {
            "400": {
                description: "Bad request",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                error: { type: "string" },
                            },
                        },
                    },
                },
            },
        };

        const converter = new ResponsesObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        const result = converter.convert();
        expect(result?.errors).toBeDefined();
        expect(result?.errors[0]?.statusCode).toBe(400);
        expect(result?.errors[0]?.description).toBe("Bad request");
    });

    it("should handle responses with headers", () => {
        const input: OpenAPIV3_1.ResponsesObject = {
            "200": {
                description: "Success with headers",
                headers: {
                    "X-Rate-Limit": {
                        schema: {
                            type: "integer",
                        },
                    },
                },
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                        },
                    },
                },
            },
        };

        const converter = new ResponsesObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        const result = converter.convert();
        expect(result?.responses[0]?.headers).toBeDefined();
    });

    it("should handle default responses", () => {
        const input: OpenAPIV3_1.ResponsesObject = {
            default: {
                description: "Default response",
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                        },
                    },
                },
            },
            "200": {
                description: "Success",
            },
        };

        const converter = new ResponsesObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        const result = converter.convert();
        expect(result?.responses).toBeDefined();
    });

    it("should handle empty responses", () => {
        const input: OpenAPIV3_1.ResponsesObject = {};

        const converter = new ResponsesObjectConverterNode({
            input,
            context: mockContext,
            accessPath: [],
            pathId: "test",
        });

        const result = converter.convert();
        expect(result?.responses).toEqual([]);
        expect(result?.errors).toEqual([]);
    });
});
