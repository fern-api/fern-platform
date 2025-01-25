import { createMockContext } from "../../../__test__/createMockContext.util";
import { BaseOpenApiV3_1ConverterNodeConstructorArgs } from "../../../BaseOpenApiV3_1Converter.node";
import { X_FERN_SERVER_NAME } from "../fernExtension.consts";
import { XFernServerNameConverterNode } from "../XFernServerNameConverter.node";

describe("XFernServerNameConverterNode", () => {
  const mockContext = createMockContext();

  const baseArgs: BaseOpenApiV3_1ConverterNodeConstructorArgs<unknown> = {
    input: {},
    context: mockContext,
    accessPath: [],
    pathId: "test",
  };

  describe("convert()", () => {
    it("should return undefined when no server name is provided", () => {
      const converter = new XFernServerNameConverterNode({
        ...baseArgs,
        input: {},
      });

      const result = converter.convert();
      expect(result).toBeUndefined();
    });

    it("should return the server name when provided", () => {
      const serverName = "production";
      const converter = new XFernServerNameConverterNode({
        ...baseArgs,
        input: {
          [X_FERN_SERVER_NAME]: serverName,
        },
      });

      const result = converter.convert();
      expect(result).toBe(serverName);
    });
  });
});
