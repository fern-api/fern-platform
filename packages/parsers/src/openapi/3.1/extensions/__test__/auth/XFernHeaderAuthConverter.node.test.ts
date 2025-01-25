import { createMockContext } from "../../../../__test__/createMockContext.util";
import { XFernHeaderAuthConverterNode } from "../../auth/XFernHeaderAuthConverter.node";
import { HeaderTokenSecurityScheme } from "../../auth/types/TokenSecurityScheme";

describe("XFernHeaderAuthConverterNode", () => {
  const mockContext = createMockContext();

  it("should parse header auth with name, env and prefix", () => {
    const input = {
      "x-fern-header": {
        name: "myHeader",
        env: "MY_HEADER_ENV",
        prefix: "Bearer",
      } as HeaderTokenSecurityScheme,
    };

    const node = new XFernHeaderAuthConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.headerVariableName).toBe("myHeader");
    expect(node.headerEnvVar).toBe("MY_HEADER_ENV");
    expect(node.headerPrefix).toBe("Bearer");

    const converted = node.convert();
    expect(converted).toEqual({
      name: "myHeader",
      env: "MY_HEADER_ENV",
      prefix: "Bearer",
    });
  });

  it("should handle missing header auth", () => {
    const input = {};

    const node = new XFernHeaderAuthConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.headerVariableName).toBeUndefined();
    expect(node.headerEnvVar).toBeUndefined();
    expect(node.headerPrefix).toBeUndefined();

    const converted = node.convert();
    expect(converted).toEqual({
      name: undefined,
      env: undefined,
      prefix: undefined,
    });
  });

  it("should handle partial header auth info", () => {
    const input = {
      "x-fern-header": {
        name: "myHeader",
        prefix: "Bearer",
      } as HeaderTokenSecurityScheme,
    };

    const node = new XFernHeaderAuthConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    expect(node.headerVariableName).toBe("myHeader");
    expect(node.headerEnvVar).toBeUndefined();
    expect(node.headerPrefix).toBe("Bearer");

    const converted = node.convert();
    expect(converted).toEqual({
      name: "myHeader",
      env: undefined,
      prefix: "Bearer",
    });
  });
});
