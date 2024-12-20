import { createMockContext } from "../../../../__test__/createMockContext.util";
import { FernRegistry } from "../../../../client/generated";
import { BaseOpenApiV3_1ConverterNodeConstructorArgs } from "../../../BaseOpenApiV3_1Converter.node";
import { RequestMediaTypeObjectConverterNode, ResponseMediaTypeObjectConverterNode } from "../../paths";
import { XFernEndpointExampleConverterNode } from "../XFernEndpointExampleConverter.node";

describe("XFernEndpointExampleConverterNode", () => {
    const mockContext = createMockContext();

    const baseArgs: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown> = {
        input: {},
        context: mockContext,
        accessPath: [],
        pathId: "test",
    };

    describe("convert()", () => {
        it("should handle JSON request and response", () => {
            const converter = new XFernEndpointExampleConverterNode(
                {
                    ...baseArgs,
                    input: {
                        "x-fern-examples": [
                            {
                                name: "Create user",
                                docs: "Example of creating a user",
                                request: {
                                    name: "John Doe",
                                    email: "john@example.com",
                                },
                                response: {
                                    body: {
                                        id: "123",
                                        name: "John Doe",
                                        email: "john@example.com",
                                    },
                                },
                            },
                        ],
                    },
                },
                "/users",
                200,
                {
                    "application/json": {
                        contentType: "json",
                    } as RequestMediaTypeObjectConverterNode,
                },
                undefined,
                [
                    {
                        contentType: "application/json",
                    } as ResponseMediaTypeObjectConverterNode,
                ],
            );

            const result = converter.convert();

            expect(result).toEqual([
                {
                    path: "/users",
                    responseStatusCode: 200,
                    name: "Create user",
                    description: "Example of creating a user",
                    pathParameters: {},
                    queryParameters: {},
                    headers: {},
                    requestBody: {
                        type: "json",
                        value: {
                            name: "John Doe",
                            email: "john@example.com",
                        },
                    },
                    responseBody: {
                        type: "json",
                        value: {
                            id: "123",
                            name: "John Doe",
                            email: "john@example.com",
                        },
                    },
                    snippets: {},
                },
            ]);
        });

        it("should handle form data request", () => {
            const converter = new XFernEndpointExampleConverterNode(
                {
                    ...baseArgs,
                    input: {
                        "x-fern-examples": [
                            {
                                name: "Upload file",
                                request: {
                                    file: {
                                        filename: "test.txt",
                                        data: "SGVsbG8gd29ybGQ=", // base64 encoded "Hello world"
                                    },
                                },
                                response: {
                                    body: {
                                        success: true,
                                    },
                                },
                            },
                        ],
                    },
                },
                "/upload",
                200,
                {
                    "multipart/form-data": {
                        contentType: "form-data",
                        fields: {
                            file: {
                                multipartType: "file",
                            },
                        },
                    } as unknown as RequestMediaTypeObjectConverterNode,
                },
                undefined,
                [
                    {
                        contentType: "application/json",
                    } as ResponseMediaTypeObjectConverterNode,
                ],
            );

            const result = converter.convert();

            expect(result).toEqual([
                {
                    path: "/upload",
                    responseStatusCode: 200,
                    name: "Upload file",
                    pathParameters: {},
                    queryParameters: {},
                    headers: {},
                    requestBody: {
                        type: "form",
                        value: {
                            file: {
                                type: "filenameWithData",
                                filename: "test.txt",
                                data: FernRegistry.FileId("SGVsbG8gd29ybGQ="),
                            },
                        },
                    },
                    responseBody: {
                        type: "json",
                        value: {
                            success: true,
                        },
                    },
                    snippets: {},
                },
            ]);
        });

        it("should handle SSE response", () => {
            const converter = new XFernEndpointExampleConverterNode(
                {
                    ...baseArgs,
                    input: {
                        "x-fern-examples": [
                            {
                                name: "Stream events",
                                request: {},
                                response: {
                                    stream: [
                                        {
                                            event: "update",
                                            data: { progress: 50 },
                                        },
                                        {
                                            event: "complete",
                                            data: { progress: 100 },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                },
                "/stream",
                200,
                {
                    "application/json": {
                        contentType: "json",
                    } as RequestMediaTypeObjectConverterNode,
                },
                undefined,
                [
                    {
                        contentType: "text/event-stream",
                    } as ResponseMediaTypeObjectConverterNode,
                ],
            );

            const result = converter.convert();

            expect(result).toEqual([
                {
                    path: "/stream",
                    responseStatusCode: 200,
                    name: "Stream events",
                    pathParameters: {},
                    queryParameters: {},
                    headers: {},
                    requestBody: {
                        type: "json",
                        value: {},
                    },
                    responseBody: {
                        type: "sse",
                        value: [
                            {
                                event: "update",
                                data: { progress: 50 },
                            },
                            {
                                event: "complete",
                                data: { progress: 100 },
                            },
                        ],
                    },
                    snippets: {},
                },
            ]);
        });
    });
});
