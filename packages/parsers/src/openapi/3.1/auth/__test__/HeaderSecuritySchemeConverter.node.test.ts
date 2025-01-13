import { createMockContext } from "../../../__test__/createMockContext.util";
import { HeaderSecuritySchemeConverterNode } from "../HeaderSecuritySchemeConverter.node";

describe("HeaderSecuritySchemeConverterNode", () => {
  const mockContext = createMockContext();

  it("should parse header auth with all fields", () => {
    const input = {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      "x-fern-header-variable-name": "myHeader",
      "x-fern-header": {
        name: "customHeader",
        prefix: "Bearer",
        env: "MY_HEADER_ENV",
      },
      "x-bearer-format": "JWT",
    } as HeaderSecuritySchemeConverterNode.Input;

    const node = new HeaderSecuritySchemeConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    const converted = node.convert();
    expect(converted).toEqual({
      type: "header",
      nameOverride: "customHeader",
      headerWireValue: "Authorization",
      prefix: "Bearer",
    });
  });

  it("should use bearer format when prefix not provided", () => {
    const input = {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      "x-fern-header": {
        name: "customHeader",
        env: "MY_HEADER_ENV",
      },
      "x-bearer-format": "JWT",
    } as HeaderSecuritySchemeConverterNode.Input;

    const node = new HeaderSecuritySchemeConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    const converted = node.convert();
    expect(converted).toEqual({
      type: "header",
      nameOverride: "customHeader",
      headerWireValue: "Authorization",
      prefix: "JWT",
    });
  });

  it("should use default Authorization header when variable name not provided", () => {
    const input = {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      "x-fern-header": {
        name: "customHeader",
        prefix: "Bearer",
      },
    } as HeaderSecuritySchemeConverterNode.Input;

    const node = new HeaderSecuritySchemeConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
    });

    const converted = node.convert();
    expect(converted).toEqual({
      type: "header",
      nameOverride: "customHeader",
      headerWireValue: "Authorization",
      prefix: "Bearer",
    });
  });
});
