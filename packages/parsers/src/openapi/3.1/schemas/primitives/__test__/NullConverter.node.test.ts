import { createMockContext } from "../../../../../__test__/createMockContext.util";
import { NullConverterNode } from "../NullConverter.node";

describe("NullConverterNode", () => {
  const mockContext = createMockContext();

  describe("convert", () => {
    it("should convert null schema to unknown type", () => {
      const input: NullConverterNode.Input = {
        type: "null",
      };
      const node = new NullConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      const result = node.convert();

      expect(result).toEqual({
        type: "alias",
        value: {
          type: "nullable",
          shape: {
            type: "alias",
            value: {
              type: "unknown",
              displayName: undefined,
            },
          },
        },
      });
    });

    it("should handle conversion with title", () => {
      const input: NullConverterNode.Input = {
        type: "null",
        title: "NullType",
      };
      const node = new NullConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      const result = node.convert();

      expect(result).toEqual({
        type: "alias",
        value: {
          type: "nullable",
          shape: {
            type: "alias",
            value: {
              type: "unknown",
              displayName: "NullType",
            },
          },
        },
      });
    });
  });
});
