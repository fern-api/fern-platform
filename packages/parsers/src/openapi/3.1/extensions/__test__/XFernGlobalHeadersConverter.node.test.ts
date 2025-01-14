import { createMockContext } from "../../../__test__/createMockContext.util";
import { X_FERN_GLOBAL_HEADERS } from "../fernExtension.consts";
import { XFernGlobalHeadersConverterNode } from "../XFernGlobalHeadersConverter.node";

describe("XFernGlobalHeadersConverterNode", () => {
  const mockContext = createMockContext();
  const mockAccessPath = ["test", "path"];
  const mockPathId = "test-path";

  beforeEach(() => {
    mockContext.errors.warning.mockClear();
  });

  it("should parse global headers correctly", () => {
    const input = {
      [X_FERN_GLOBAL_HEADERS]: [
        {
          header: "X-API-Key",
          type: "string",
          description: "API Key for authentication",
        },
      ],
    };

    const converter = new XFernGlobalHeadersConverterNode({
      input,
      context: mockContext,
      accessPath: mockAccessPath,
      pathId: mockPathId,
    });

    expect(converter.globalHeaders).toBeDefined();
    expect(converter.globalHeaders?.length).toBe(1);
    expect(converter.globalHeaders?.[0][0]).toBe("X-API-Key");
  });

  it("should handle empty input", () => {
    const input = {};

    const converter = new XFernGlobalHeadersConverterNode({
      input,
      context: mockContext,
      accessPath: mockAccessPath,
      pathId: mockPathId,
    });

    expect(converter.globalHeaders).toBeUndefined();
  });

  it("should convert global headers to ObjectProperties", () => {
    const input = {
      [X_FERN_GLOBAL_HEADERS]: [
        {
          header: "X-API-Key",
          type: "string",
          description: "API Key for authentication",
        },
      ],
    };

    const converter = new XFernGlobalHeadersConverterNode({
      input,
      context: mockContext,
      accessPath: mockAccessPath,
      pathId: mockPathId,
    });

    const result = converter.convert();

    expect(result).toBeDefined();
    expect(result?.length).toBe(1);
    expect(result?.[0].key).toBe("X-API-Key");
    expect(result?.[0].description).toBe("API Key for authentication");
  });

  it("should handle multiple global headers", () => {
    const input = {
      [X_FERN_GLOBAL_HEADERS]: [
        {
          header: "X-API-Key",
          type: "string",
        },
        {
          header: "X-Client-ID",
          type: "string",
        },
      ],
    };

    const converter = new XFernGlobalHeadersConverterNode({
      input,
      context: mockContext,
      accessPath: mockAccessPath,
      pathId: mockPathId,
    });

    const result = converter.convert();

    expect(result).toBeDefined();
    expect(result?.length).toBe(2);
    expect(result?.[0].key).toBe("X-API-Key");
    expect(result?.[1].key).toBe("X-Client-ID");
  });
});
