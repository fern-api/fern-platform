import { createMockContext } from "../../../../__test__/createMockContext.util";
import { XFernBearerTokenConverterNode } from "../../auth/XFernBearerTokenConverter.node";
import { TokenSecurityScheme } from "../../auth/types/TokenSecurityScheme";

describe("XFernBearerTokenConverterNode", () => {
  const mockContext = createMockContext();

  it("should parse bearer token with name and env", () => {
    const input = {
      "x-fern-bearer": {
        name: "myToken",
        env: "MY_TOKEN_ENV",
      } as TokenSecurityScheme,
    };

    const node = new XFernBearerTokenConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.bearerTokenVariableName).toBe("myToken");
    expect(node.bearerTokenEnvVar).toBe("MY_TOKEN_ENV");

    const converted = node.convert();
    expect(converted).toEqual({
      tokenVariableName: "myToken",
      tokenEnvVar: "MY_TOKEN_ENV",
    });
  });

  it("should handle missing bearer token", () => {
    const input = {};

    const node = new XFernBearerTokenConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.bearerTokenVariableName).toBeUndefined();
    expect(node.bearerTokenEnvVar).toBeUndefined();

    const converted = node.convert();
    expect(converted).toEqual({
      tokenVariableName: undefined,
      tokenEnvVar: undefined,
    });
  });

  it("should handle partial bearer token info", () => {
    const input = {
      "x-fern-bearer": {
        name: "myToken",
      } as TokenSecurityScheme,
    };

    const node = new XFernBearerTokenConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.bearerTokenVariableName).toBe("myToken");
    expect(node.bearerTokenEnvVar).toBeUndefined();

    const converted = node.convert();
    expect(converted).toEqual({
      tokenVariableName: "myToken",
      tokenEnvVar: undefined,
    });
  });
});
