import { OpenAPIV3_1 } from "openapi-types";
import { expect } from "vitest";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { EnumConverterNode } from "../EnumConverter.node";

describe("EnumConverterNode", () => {
  const mockContext = createMockContext({
    components: {
      schemas: {
        Status: { type: "string", default: "ACTIVE" },
      },
    },
  } as unknown as OpenAPIV3_1.Document);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should handle enum schema with no values", () => {
      const input: OpenAPIV3_1.NonArraySchemaObject = {
        type: "object",
      };
      const node = new EnumConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.values).toEqual([]);
      expect(node.default).toBeUndefined();
    });

    it("should handle enum schema with valid string values", () => {
      const input: OpenAPIV3_1.NonArraySchemaObject = {
        type: "object",
        enum: ["ONE", "TWO", "THREE"],
      };
      const node = new EnumConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.values).toEqual(["ONE", "TWO", "THREE"]);
    });

    it("should deduplicate enum values", () => {
      const input: OpenAPIV3_1.NonArraySchemaObject = {
        type: "object",
        enum: ["ONE", "TWO", "ONE", "THREE"],
      };
      const node = new EnumConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.values).toEqual(["ONE", "TWO", "THREE"]);
    });

    it("should error when enum values are not strings", () => {
      const input = {
        type: "object",
        enum: ["ONE", 2, "THREE"],
      } as OpenAPIV3_1.NonArraySchemaObject;

      new EnumConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });

      expect(mockContext.errors.error).toHaveBeenCalledWith({
        message: "Expected enum values to be strings. Received 2",
        path: ["test", "enum[1]"],
      });
    });

    it("should handle enum schema with $ref", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        enum: [{ $ref: "#/components/schemas/Status" }],
      };
      const node = new EnumConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.convert()).toEqual({
        type: "enum",
        values: [
          {
            value: "ACTIVE",
          },
        ],
      });
    });
  });

  describe("convert", () => {
    it("should convert enum schema with values", () => {
      const input: OpenAPIV3_1.NonArraySchemaObject = {
        type: "object",
        enum: ["ONE", "TWO"],
        default: "ONE",
      };
      const node = new EnumConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.convert()).toEqual({
        type: "enum",
        values: [
          { value: "ONE", description: undefined, availability: undefined },
          { value: "TWO", description: undefined, availability: undefined },
        ],
        default: "ONE",
      });
    });

    it("should convert empty enum schema", () => {
      const input: OpenAPIV3_1.NonArraySchemaObject = {
        type: "object",
      };
      const node = new EnumConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
      });
      expect(node.convert()).toEqual({
        type: "enum",
        values: [],
        default: undefined,
      });
    });
  });
});
