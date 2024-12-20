import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { ResponseObjectConverterNode } from "../../response/ResponseObjectConverter.node";

describe("ResponseObjectConverterNode", () => {
  const mockContext = createMockContext();

  it("should handle basic response object", () => {
    const input: OpenAPIV3_1.ResponseObject = {
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
    };

    const converter = new ResponseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(converter.description).toBe("Success response");
    expect(converter.responses).toBeDefined();
    expect(converter.responses?.length).toBe(1);
  });

  it("should handle response with headers", () => {
    const input: OpenAPIV3_1.ResponseObject = {
      description: "Response with headers",
      headers: {
        "X-Rate-Limit": {
          schema: {
            type: "integer",
          },
        },
      },
    };

    const converter = new ResponseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(converter.headers).toBeDefined();
    expect(converter.headers?.["X-Rate-Limit"]).toBeDefined();
  });

  it("should handle reference objects", () => {
    const input: OpenAPIV3_1.ReferenceObject = {
      $ref: "#/components/responses/SuccessResponse",
    };

    mockContext.document.components ??= {};
    mockContext.document.components.responses = {
      SuccessResponse: {
        description: "Referenced response",
        content: {
          "application/json": {
            schema: {
              type: "object",
            },
          },
        },
      },
    };

    const converter = new ResponseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(converter.responses).toBeDefined();
    expect(converter.responses?.length).toBe(1);
  });

  it("should handle null reference resolution", () => {
    const input: OpenAPIV3_1.ReferenceObject = {
      $ref: "#/components/responses/NonExistent",
    };

    new ResponseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(mockContext.errors.error).toHaveBeenCalledWith({
      message: "Undefined reference: #/components/responses/NonExistent",
      path: ["test"],
    });
  });

  it("should convert responses to body shapes", () => {
    const input: OpenAPIV3_1.ResponseObject = {
      description: "Multiple responses",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              data: { type: "string" },
            },
          },
        },
        "application/octet-stream": {
          schema: {
            type: "string",
            contentMediaType: "image/png",
          },
        },
      },
    };

    const converter = new ResponseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    const shapes = converter.convert();
    expect(shapes).toBeDefined();
    expect(shapes?.length).toBe(2);
  });
});
