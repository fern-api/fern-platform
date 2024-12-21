import { createMockContext } from "../../../../__test__/createMockContext.util";
import { FernRegistry } from "../../../../client/generated";
import { MixedSchemaConverterNode } from "../MixedSchemaConverter.node";

describe("MixedSchemaConverterNode", () => {
  const mockContext = createMockContext();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should handle mixed schema with null type", () => {
      const input: MixedSchemaConverterNode.Input = [
        { type: "null" },
        { type: "string" },
      ];

      const node = new MixedSchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      expect(node.nullable).toBe(true);
      expect(node.typeNodes?.length).toBe(1);
    });

    it("should handle mixed schema with multiple non-null types", () => {
      const input: MixedSchemaConverterNode.Input = [
        { type: "string" },
        { type: "number" },
      ];

      const node = new MixedSchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      expect(node.nullable).toBeUndefined();
      expect(node.typeNodes?.length).toBe(2);
    });
  });

  describe("convert", () => {
    it("should convert to undiscriminatedUnion when not nullable", () => {
      const input: MixedSchemaConverterNode.Input = [
        { type: "string" },
        { type: "number" },
      ];

      const node = new MixedSchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const result = node.convert();
      expect(result?.type).toBe("undiscriminatedUnion");
      expect(
        (result as FernRegistry.api.latest.TypeShape.UndiscriminatedUnion)
          ?.variants?.length
      ).toBe(2);
    });

    it("should convert to optional alias when nullable", () => {
      const input: MixedSchemaConverterNode.Input = [
        { type: "null" },
        { type: "string" },
      ];

      const node = new MixedSchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      const result = node.convert();
      expect(result?.type).toBe("alias");
      expect(
        (result as FernRegistry.api.latest.TypeShape.Alias)?.value?.type
      ).toBe("optional");
    });

    it("should return undefined when typeNodes is null", () => {
      const input: MixedSchemaConverterNode.Input = [];

      const node = new MixedSchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      node.typeNodes = undefined;
      const result = node.convert();
      expect(result).toBeUndefined();
    });
  });
});
