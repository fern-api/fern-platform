import { createMockContext } from "../../../../__test__/createMockContext.util";
import { ObjectConverterNode } from "../ObjectConverter.node";
import { SchemaConverterNode } from "../SchemaConverter.node";

describe("ObjectConverterNode", () => {
  const mockContext = createMockContext();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should handle object schema with no properties", () => {
      const input: ObjectConverterNode.Input = {
        type: "object",
      };
      const node = new ObjectConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.extends).toEqual([]);
      expect(node.properties).toEqual({});
      expect(node.extraProperties).toBeUndefined();
    });

    it("should handle object schema with properties", () => {
      const input: ObjectConverterNode.Input = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
      };
      const node = new ObjectConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(Object.keys(node.properties ?? {})).toEqual(["name", "age"]);
      expect(node.properties?.name).toBeInstanceOf(SchemaConverterNode);
      expect(node.properties?.age).toBeInstanceOf(SchemaConverterNode);
    });

    it("should handle additionalProperties as boolean true", () => {
      const input: ObjectConverterNode.Input = {
        type: "object",
        additionalProperties: true,
        title: "TestObject",
      };
      const node = new ObjectConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.extraProperties).toBeDefined();
      const converted = node.convert()[0]?.extraProperties;
      expect(converted).toEqual({
        type: "unknown",
        displayName: "TestObject",
      });
    });

    it("should handle additionalProperties as boolean false", () => {
      const input: ObjectConverterNode.Input = {
        type: "object",
        additionalProperties: false,
      };
      const node = new ObjectConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.extraProperties).toBeUndefined();
    });

    it("should handle additionalProperties as schema", () => {
      const input: ObjectConverterNode.Input = {
        type: "object",
        additionalProperties: { type: "string" },
      };
      const node = new ObjectConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.extraProperties).toBeInstanceOf(SchemaConverterNode);
    });
  });

  describe("convert", () => {
    it("should convert basic object schema", () => {
      const input: ObjectConverterNode.Input = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      };
      const node = new ObjectConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      const converted = node.convert();
      expect(converted).toEqual([
        {
          type: "object",
          extends: [],
          properties: [
            {
              key: "name",
              valueShape: expect.any(Object),
              description: undefined,
              availability: undefined,
            },
          ],
          extraProperties: undefined,
        },
      ]);
    });

    it("should convert object schema with extra properties", () => {
      const input: ObjectConverterNode.Input = {
        type: "object",
        additionalProperties: true,
        title: "TestObject",
      };
      const node = new ObjectConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      const converted = node.convert();
      expect(converted).toEqual([
        {
          type: "object",
          extends: [],
          properties: [],
          extraProperties: {
            type: "unknown",
            displayName: "TestObject",
          },
        },
      ]);
    });
  });
});
