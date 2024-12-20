import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { BaseOpenApiV3_1ConverterNodeConstructorArgs } from "../../../../BaseOpenApiV3_1Converter.node";
import { ExampleObjectConverterNode } from "../../ExampleObjectConverter.node";
import { RequestMediaTypeObjectConverterNode } from "../../request/RequestMediaTypeObjectConverter.node";
import { ResponseMediaTypeObjectConverterNode } from "../../response/ResponseMediaTypeObjectConverter.node";

describe("ExampleObjectConverterNode", () => {
  const mockContext = createMockContext();

  const baseArgs: BaseOpenApiV3_1ConverterNodeConstructorArgs<{
    requestExample: OpenAPIV3_1.ExampleObject | undefined;
    responseExample: OpenAPIV3_1.ExampleObject | undefined;
  }> = {
    input: {
      requestExample: undefined,
      responseExample: undefined,
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
  const mockResponseBody = {
    contentType: "json" as const,
    resolvedSchema: {},
  };

  describe("parse()", () => {
    it("should error if json example is not an object", () => {
      new ExampleObjectConverterNode(
        {
          ...baseArgs,
          input: {
            requestExample: {
              value: "not an object",
            },
            responseExample: undefined,
          },
        },
        mockPath,
        mockResponseStatusCode,
        "test",
        mockRequestBody as unknown as RequestMediaTypeObjectConverterNode,
        mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
        undefined
      );

      expect(mockContext.errors.error).toHaveBeenCalledWith({
        message: "Invalid example, expected object for json",
        path: ["test"],
      });
    });

    it("should error if response body schema is missing", () => {
      new ExampleObjectConverterNode(
        baseArgs,
        mockPath,
        mockResponseStatusCode,
        "test",
        mockRequestBody as unknown as RequestMediaTypeObjectConverterNode,
        {
          ...mockResponseBody,
          resolvedSchema: undefined,
        } as unknown as ResponseMediaTypeObjectConverterNode,
        undefined
      );

      expect(mockContext.errors.error).toHaveBeenCalledWith({
        message: "Invalid example, expected object for json",
        path: ["test"],
      });
    });

    it("should error if response json example is not an object", () => {
      new ExampleObjectConverterNode(
        {
          ...baseArgs,
          input: {
            requestExample: undefined,
            responseExample: {
              value: "not an object",
            },
          },
        },
        mockPath,
        mockResponseStatusCode,
        "test",
        mockRequestBody as unknown as RequestMediaTypeObjectConverterNode,
        mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
        undefined
      );

      expect(mockContext.errors.error).toHaveBeenCalledWith({
        message: "Invalid example, expected object for json",
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
            requestExample: {
              value,
              summary: "Test example",
              description: "Test description",
            },
            responseExample: undefined,
          },
        },
        mockPath,
        mockResponseStatusCode,
        "Test example",
        mockRequestBody as unknown as RequestMediaTypeObjectConverterNode,
        mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
        undefined
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

    it("should convert json response body", () => {
      const value = { id: "123", name: "Test User" };
      const converter = new ExampleObjectConverterNode(
        {
          ...baseArgs,
          input: {
            requestExample: undefined,
            responseExample: {
              value,
              summary: "Test response",
              description: "Test response description",
            },
          },
        },
        mockPath,
        mockResponseStatusCode,
        "test",
        mockRequestBody as unknown as RequestMediaTypeObjectConverterNode,
        new ResponseMediaTypeObjectConverterNode(
          {
            input: {
              schema: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  name: { type: "string" },
                },
              },
            },
            context: mockContext,
            accessPath: [],
            pathId: "test",
          },
          "application/json",
          undefined,
          "testpath",
          200,
          undefined
        ),
        undefined
      );

      const result = converter.convert();

      expect(result).toEqual({
        path: mockPath,
        responseStatusCode: mockResponseStatusCode,
        name: "test",
        description: "Test response description",
        pathParameters: undefined,
        queryParameters: undefined,
        headers: undefined,
        requestBody: undefined,
        responseBody: {
          type: "json",
          value,
        },
        snippets: undefined,
      });
    });

    it("should convert bytes request body", () => {
      const value = "base64string";
      const converter = new ExampleObjectConverterNode(
        {
          ...baseArgs,
          input: {
            requestExample: {
              value,
            },
            responseExample: undefined,
          },
        },
        mockPath,
        mockResponseStatusCode,
        "test",
        {
          ...mockRequestBody,
          contentType: "bytes" as const,
        } as unknown as RequestMediaTypeObjectConverterNode,
        mockResponseBody as unknown as ResponseMediaTypeObjectConverterNode,
        undefined
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

    it("should convert bytes response body", () => {
      const value = "base64string";
      const converter = new ExampleObjectConverterNode(
        {
          ...baseArgs,
          input: {
            requestExample: undefined,
            responseExample: {
              value,
            },
          },
        },
        mockPath,
        mockResponseStatusCode,
        "test",
        mockRequestBody as unknown as RequestMediaTypeObjectConverterNode,
        {
          ...mockResponseBody,
          contentType: "application/octet-stream" as const,
        } as unknown as ResponseMediaTypeObjectConverterNode,
        undefined
      );

      const result = converter.convert();

      expect(result?.responseBody).toEqual({
        type: "filename",
        value,
      });
    });
  });

  describe("validateFormDataExample()", () => {
    it("should validate file field", () => {
      const converter = new ExampleObjectConverterNode(
        {
          ...baseArgs,
          input: {
            requestExample: {
              value: {
                file: {
                  filename: "test.txt",
                  data: "base64data",
                },
              },
            },
            responseExample: undefined,
          },
        },
        mockPath,
        mockResponseStatusCode,
        "test",
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
        undefined
      );

      expect(converter.validateFormDataRequestExample()).toBe(true);
    });

    it("should validate files field", () => {
      const converter = new ExampleObjectConverterNode(
        {
          ...baseArgs,
          input: {
            requestExample: {
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
            responseExample: undefined,
          },
        },
        mockPath,
        mockResponseStatusCode,
        "test",
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
        undefined
      );

      expect(converter.validateFormDataRequestExample()).toBe(true);
    });
  });
});
