import { createMockContext } from "../../../../__test__/createMockContext.util";
import { StringConverterNode } from "../StringConverter.node";

describe("StringConverterNode", () => {
  const mockContext = createMockContext();

  describe("constructor", () => {
    it("should handle default value", () => {
      const input: StringConverterNode.Input = {
        type: "string",
        default: "test-default",
      };
      const node = new StringConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.default).toBe("test-default");
    });

    it("should warn on invalid default value", () => {
      const input = {
        type: "string",
        default: 123,
      } as const;
      new StringConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(mockContext.errors.warning).toHaveBeenCalledWith({
        message: "Expected default value to be a string. Received 123",
        path: ["test"],
      });
    });
  });

  describe("mapToFdrType", () => {
    it("should warn on invalid format", () => {
      const input = {
        type: "string",
        format: "invalid-format",
      } as const;
      new StringConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(mockContext.errors.warning).toHaveBeenCalled();
    });
  });

  describe("convert", () => {
    it("should return correct FdrStringType", () => {
      const input: StringConverterNode.Input = {
        type: "string",
        format: "uuid",
        default: "test-default",
      };
      const node = new StringConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.convert()).toEqual({
        type: "alias",
        value: {
          type: "primitive",
          value: {
            type: "uuid",
            default: "test-default",
          },
        },
      });
    });
  });
});
