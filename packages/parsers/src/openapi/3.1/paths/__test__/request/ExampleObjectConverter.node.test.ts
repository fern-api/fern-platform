import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { BaseOpenApiV3_1ConverterNodeConstructorArgs } from "../../../../BaseOpenApiV3_1Converter.node";
import { ExampleObjectConverterNode } from "../../request/ExampleObjectConverter.node";
import { RequestMediaTypeObjectConverterNode } from "../../request/RequestMediaTypeObjectConverter.node";
import { ResponseMediaTypeObjectConverterNode } from "../../response/ResponseMediaTypeObjectConverter.node";

describe("ExampleObjectConverterNode", () => {
    const mockContext = createMockContext();

    const baseArgs: BaseOpenApiV3_1ConverterNodeConstructorArgs<OpenAPIV3_1.ExampleObject> = {
        input: {
            value: {},
        },
        context: mockContext,
        accessPath: [],
        pathId: "test",
    };

    const mockPath = "/users";
    const mockResponseStatusCode = 200;
    const mockRequestBody = {
        contentType: "json" as const,
        resolvedSchema: {},
    };
    const mockResponseBody = {};

    describe("parse()", () => {
        it("should error if request body schema is missing", () => {
            new ExampleObjectConverterNode(
                baseArgs,
                mockPath,
                mockResponseStatusCode,
                { ...mockRequestBody, resolvedSchema: undefined } as RequestMediaTypeObjectConverterNode,
                mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
                undefined,
                undefined,
                undefined,
            );

            expect(mockContext.errors.error).toHaveBeenCalledWith({
                message: "Request body schema is required",
                path: ["test"],
            });
        });

        it("should error if json example is not an object", () => {
            new ExampleObjectConverterNode(
                {
                    ...baseArgs,
                    input: {
                        value: "not an object",
                    },
                },
                mockPath,
                mockResponseStatusCode,
                mockRequestBody as unknown as RequestMediaTypeObjectConverterNode,
                mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
                undefined,
                undefined,
                undefined,
            );

            expect(mockContext.errors.error).toHaveBeenCalledWith({
                message: "Invalid example object, expected object for json",
                path: ["test"],
            });
        });
    });

    describe("convert()", () => {
        it("should convert json request body", () => {
            const value = { foo: "bar" };
            const converter = new ExampleObjectConverterNode(
                {
                    ...baseArgs,
                    input: {
                        value,
                        summary: "Test example",
                        description: "Test description",
                    },
                },
                mockPath,
                mockResponseStatusCode,
                mockRequestBody as unknown as RequestMediaTypeObjectConverterNode,
                mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
                undefined,
                undefined,
                undefined,
            );

            const result = converter.convert();

            expect(result).toEqual({
                path: mockPath,
                responseStatusCode: mockResponseStatusCode,
                name: "Test example",
                description: "Test description",
                pathParameters: undefined,
                queryParameters: undefined,
                headers: undefined,
                requestBody: {
                    type: "json",
                    value,
                },
                responseBody: undefined,
                snippets: undefined,
            });
        });

        it("should convert bytes request body", () => {
            const value = "base64string";
            const converter = new ExampleObjectConverterNode(
                {
                    ...baseArgs,
                    input: {
                        value,
                    },
                },
                mockPath,
                mockResponseStatusCode,
                { ...mockRequestBody, contentType: "bytes" as const } as unknown as RequestMediaTypeObjectConverterNode,
                mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
                undefined,
                undefined,
                undefined,
            );

            const result = converter.convert();

            expect(result?.requestBody).toEqual({
                type: "bytes",
                value: {
                    type: "base64",
                    value,
                },
            });
        });
    });

    describe("validateFormDataExample()", () => {
        it("should validate file field", () => {
            const converter = new ExampleObjectConverterNode(
                {
                    ...baseArgs,
                    input: {
                        value: {
                            file: {
                                filename: "test.txt",
                                data: "base64data",
                            },
                        },
                    },
                },
                mockPath,
                mockResponseStatusCode,
                {
                    ...mockRequestBody,
                    contentType: "form-data" as const,
                    fields: {
                        file: {
                            multipartType: "file",
                        },
                    },
                } as unknown as RequestMediaTypeObjectConverterNode,
                mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
                undefined,
                undefined,
                undefined,
            );

            expect(converter.validateFormDataExample()).toBe(true);
        });

        it("should validate files field", () => {
            const converter = new ExampleObjectConverterNode(
                {
                    ...baseArgs,
                    input: {
                        value: {
                            files: [
                                {
                                    filename: "test1.txt",
                                    data: "base64data1",
                                },
                                {
                                    filename: "test2.txt",
                                    data: "base64data2",
                                },
                            ],
                        },
                    },
                },
                mockPath,
                mockResponseStatusCode,
                {
                    ...mockRequestBody,
                    contentType: "form-data" as const,
                    fields: {
                        files: {
                            multipartType: "files",
                        },
                    },
                } as unknown as RequestMediaTypeObjectConverterNode,
                mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
                undefined,
                undefined,
                undefined,
            );

            expect(converter.validateFormDataExample()).toBe(true);
        });
    });
});
