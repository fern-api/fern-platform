import { createMockContext } from "../../../__test__/createMockContext.util";
import { ConstConverterNode } from "../ConstConverter.node";

describe("ConstConverterNode", () => {
  const context = createMockContext();

  describe("parse()", () => {
    it("handles string const", () => {
      const node = new ConstConverterNode({
        input: {
          const: "test",
          description: "test description",
        },
        context,
        accessPath: [],
        pathId: "test",
      });

      expect(node.convert()).toEqual({
        type: "enum",
        default: "test",
        values: [
          {
            value: "test",
            description: "test description",
            availability: undefined,
          },
        ],
      });
    });

    it("handles number const", () => {
      const node = new ConstConverterNode({
        input: {
          const: 123,
        },
        context,
        accessPath: [],
        pathId: "test",
      });

      expect(node.convert()).toEqual({
        type: "enum",
        default: "123",
        values: [
          {
            value: "123",
            description: undefined,
            availability: undefined,
          },
        ],
      });
    });

    it("handles boolean const", () => {
      const node = new ConstConverterNode({
        input: {
          const: true,
        },
        context,
        accessPath: [],
        pathId: "test",
      });

      expect(node.convert()).toEqual({
        type: "enum",
        default: "true",
        values: [
          {
            value: "true",
            description: undefined,
            availability: undefined,
          },
        ],
      });
    });

    it("handles unsupported const type", () => {
      const node = new ConstConverterNode({
        input: {
          const: { foo: "bar" },
        },
        context,
        accessPath: [],
        pathId: "test",
      });

      expect(node.convert()).toBeUndefined();
      expect(context.errors.warning).toHaveBeenCalledWith({
        message: expect.stringContaining("Unsupported const type"),
        path: ["test"],
      });
    });

    it("handles undefined const", () => {
      const node = new ConstConverterNode({
        input: {},
        context,
        accessPath: [],
        pathId: "test",
      });

      expect(node.convert()).toBeUndefined();
    });
  });
});
