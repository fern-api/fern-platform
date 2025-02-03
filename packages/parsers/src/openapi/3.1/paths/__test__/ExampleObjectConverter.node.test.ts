import { createMockContext } from "../../../__test__/createMockContext.util";
import { ExampleObjectConverterNode } from "../ExampleObjectConverter.node";
import { RequestMediaTypeObjectConverterNode } from "../request/RequestMediaTypeObjectConverter.node";

describe("ExampleObjectConverterNode", () => {
  const mockContext = createMockContext();

  describe("validateFormDataRequestExample", () => {
    it("should return false if input value is not an object", () => {
      const node = new ExampleObjectConverterNode(
        {
          input: {
            requestExample: { value: "not an object" },
            responseExample: undefined,
          },
          context: mockContext,
          accessPath: [],
          pathId: "test",
        },
        "/test",
        200,
        undefined,
        undefined
      );

      node.resolvedRequestInput = { value: "not an object" };
      expect(node.validateFormDataRequestExample()).toBe(false);
    });

    it("should validate file fields", () => {
      const node = new ExampleObjectConverterNode(
        {
          input: {
            requestExample: {
              value: {
                file: { filename: "test.txt", data: "base64data" },
              },
            },
            responseExample: undefined,
          },
          context: mockContext,
          accessPath: [],
          pathId: "test",
        },
        "/test",
        200,
        undefined,
        {
          requestBody: {
            contentType: "form-data",
            fields: {
              file: { multipartType: "file" },
            },
          } as unknown as RequestMediaTypeObjectConverterNode,
          responseBody: undefined,
        }
      );

      node.resolvedRequestInput = {
        value: {
          file: { filename: "test.txt", data: "base64data" },
        },
      };
      expect(node.validateFormDataRequestExample()).toBe(true);
    });
  });

  describe("convert", () => {
    it("should convert JSON request example", () => {
      const node = new ExampleObjectConverterNode(
        {
          input: {
            requestExample: { value: { foo: "bar" } },
            responseExample: undefined,
          },
          context: mockContext,
          accessPath: [],
          pathId: "test",
        },
        "/test",
        200,
        "test example",
        {
          requestBody: {
            contentType: "json",
          } as RequestMediaTypeObjectConverterNode,
          responseBody: undefined,
        }
      );

      node.resolvedRequestInput = { value: { foo: "bar" } };
      const result = node.convert();

      expect(result).toEqual({
        path: "/test",
        responseStatusCode: 200,
        name: "test example",
        description: undefined,
        pathParameters: undefined,
        queryParameters: undefined,
        headers: undefined,
        requestBody: {
          type: "json",
          value: { foo: "bar" },
        },
        responseBody: undefined,
        snippets: undefined,
      });
    });

    it("should convert bytes request example", () => {
      const node = new ExampleObjectConverterNode(
        {
          input: {
            requestExample: { value: "base64string" },
            responseExample: undefined,
          },
          context: mockContext,
          accessPath: [],
          pathId: "test",
        },
        "/test",
        200,
        undefined,
        {
          requestBody: {
            contentType: "bytes",
          } as RequestMediaTypeObjectConverterNode,
          responseBody: undefined,
        }
      );

      node.resolvedRequestInput = { value: "base64string" };
      const result = node.convert();

      expect(result?.requestBody).toEqual({
        type: "bytes",
        value: {
          type: "base64",
          value: "base64string",
        },
      });
    });
  });
});
