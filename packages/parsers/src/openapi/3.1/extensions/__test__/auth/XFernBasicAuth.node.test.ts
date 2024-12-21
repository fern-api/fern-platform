import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { XFernBasicAuthNode } from "../../auth/XFernBasicAuth.node";
import { TokenSecurityScheme } from "../../auth/types/TokenSecurityScheme";

describe("XFernBasicAuthNode", () => {
  const mockContext = createMockContext();

  it("should parse basic auth with username and password", () => {
    const input = {
      "x-fern-basic": {
        username: {
          type: "basic",
          value: "testuser",
        } as TokenSecurityScheme,
        password: {
          type: "basic",
          value: "testpass",
        } as TokenSecurityScheme,
      },
    };

    const node = new XFernBasicAuthNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.username).toEqual({
      type: "basic",
      value: "testuser",
    });
    expect(node.password).toEqual({
      type: "basic",
      value: "testpass",
    });

    const converted = node.convert();
    expect(converted).toEqual({
      username: {
        type: "basic",
        value: "testuser",
      },
      password: {
        type: "basic",
        value: "testpass",
      },
    });
  });

  it("should handle missing auth scheme", () => {
    const input = {};

    const node = new XFernBasicAuthNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.username).toBeUndefined();
    expect(node.password).toBeUndefined();

    const converted = node.convert();
    expect(converted).toEqual({
      username: undefined,
      password: undefined,
    });
  });

  it("should handle partial auth scheme", () => {
    const input = {
      "x-fern-basic": {
        username: {
          type: "basic",
          value: "testuser",
        } as TokenSecurityScheme,
      },
    };

    const node = new XFernBasicAuthNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.username).toEqual({
      type: "basic",
      value: "testuser",
    });
    expect(node.password).toBeUndefined();

    const converted = node.convert();
    expect(converted).toEqual({
      username: {
        type: "basic",
        value: "testuser",
      },
      password: undefined,
    });
  });
});
