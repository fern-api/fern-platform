import { FernRegistry } from "../../../../client/generated";
import { createMockContext } from "../../../__test__/createMockContext.util";
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
        seenSchemas: new Set(),
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
        seenSchemas: new Set(),
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
        seenSchemas: new Set(),
      });

      const result = node.convert()[0];
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
        seenSchemas: new Set(),
      });

      const result = node.convert()[0];
      expect(result?.type).toBe("alias");
      expect(
        (result as FernRegistry.api.latest.TypeShape.Alias)?.value?.type
      ).toBe("nullable");
    });

    it("should return undefined when typeNodes is null", () => {
      const input: MixedSchemaConverterNode.Input = [];

      const node = new MixedSchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
      });

      node.typeNodes = undefined;
      const result = node.convert();
      expect(result).toBeUndefined();
    });
  });
});
