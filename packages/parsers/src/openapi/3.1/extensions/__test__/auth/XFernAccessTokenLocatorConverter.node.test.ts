import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { XFernAccessTokenLocatorConverterNode } from "../../auth/XFernAccessTokenLocatorConverter.node";

describe("XFernAccessTokenLocatorConverterNode", () => {
  const mockContext = createMockContext();

  it("should parse valid JSON access token locator", () => {
    const input = {
      "x-fern-access-token-locator": "$.token.access",
    };

    const node = new XFernAccessTokenLocatorConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.accessTokenLocator).toBe("$.token.access");
    expect(node.convert()).toBe("$.token.access");
  });

  it("should handle missing access token locator", () => {
    const input = {};

    const node = new XFernAccessTokenLocatorConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.accessTokenLocator).toBeUndefined();
    expect(node.convert()).toBeUndefined();
  });

  it("should handle invalid JSON access token locator", () => {
    const input = {
      "x-fern-access-token-locator": "invalid json",
    };

    const node = new XFernAccessTokenLocatorConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(mockContext.errors.error).toHaveBeenCalledWith({
      message: "Invalid access token locator, must be a valid jq path",
      path: ["test"],
    });
    expect(node.convert()).toBeUndefined();
  });
});
export { XFernAccessTokenLocatorConverterNode };
