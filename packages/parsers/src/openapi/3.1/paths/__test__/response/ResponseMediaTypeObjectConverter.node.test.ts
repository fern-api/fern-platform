import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { SchemaConverterNode } from "../../../schemas/SchemaConverter.node";
import { ResponseMediaTypeObjectConverterNode } from "../../response/ResponseMediaTypeObjectConverter.node";

describe("ResponseMediaTypeObjectConverterNode", () => {
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

    const converter = new ResponseMediaTypeObjectConverterNode(
      {
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      },
      "application/json",
      undefined
    );

    expect(converter.contentType).toBe("application/json");
    expect(converter.schema).toBeDefined();
    expect(converter.streamingFormat).toBeUndefined();
  });

  it("should handle application/octet-stream content type", () => {
    const input: OpenAPIV3_1.MediaTypeObject = {
      schema: {
        type: "string",
        contentMediaType: "image/png",
      },
    };

    const converter = new ResponseMediaTypeObjectConverterNode(
      {
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      },
      "application/octet-stream",
      undefined
    );

    expect(converter.contentType).toBe("application/octet-stream");
    expect(converter.contentSubtype).toBe("image/png");
  });

  it("should handle streaming JSON responses", () => {
    const input: OpenAPIV3_1.MediaTypeObject = {
      schema: {
        type: "object",
        properties: {
          data: { type: "string" },
        },
      },
    };

    const converter = new ResponseMediaTypeObjectConverterNode(
      {
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      },
      "application/json",
      "json"
    );

    expect(converter.contentType).toBe("application/json");
    expect(converter.streamingFormat).toBe("json");
    expect(converter.schema).toBeDefined();
  });

  it("should handle SSE streaming responses", () => {
    const input: OpenAPIV3_1.MediaTypeObject = {};

    const converter = new ResponseMediaTypeObjectConverterNode(
      {
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      },
      "text/event-stream",
      "sse"
    );

    const result = converter.convert();
    expect(result).toEqual({ type: "streamingText" });
  });

  it("should error when JSON response is missing schema", () => {
    const input: OpenAPIV3_1.MediaTypeObject = {};

    new ResponseMediaTypeObjectConverterNode(
      {
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      },
      "application/json",
      undefined
    );

    expect(mockContext.errors.error).toHaveBeenCalledWith({
      message: "Expected schema for JSON response body. Received null",
      path: ["test"],
    });
  });

  it("should handle reference objects", () => {
    const input: OpenAPIV3_1.MediaTypeObject = {
      schema: {
        $ref: "#/components/schemas/Response",
      },
    };

    mockContext.document.components ??= {};
    mockContext.document.components.schemas = {
      Response: {
        type: "object",
        properties: {
          data: { type: "string" },
        },
      },
    };

    const converter = new ResponseMediaTypeObjectConverterNode(
      {
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      },
      "application/json",
      undefined
    );

    expect(converter.schema).toBeDefined();
    expect(converter.schema instanceof SchemaConverterNode).toBe(true);
  });
});
