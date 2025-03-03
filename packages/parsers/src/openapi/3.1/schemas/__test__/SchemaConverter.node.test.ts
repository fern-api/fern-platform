import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../__test__/createMockContext.util";
import { ObjectConverterNode } from "../ObjectConverter.node";
import { ReferenceConverterNode } from "../ReferenceConverter.node";
import { SchemaConverterNode } from "../SchemaConverter.node";

describe("SchemaConverterNode", () => {
  const mockContext = createMockContext();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should handle reference object", () => {
      const input: OpenAPIV3_1.ReferenceObject = {
        $ref: "#/components/schemas/Pet",
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeInstanceOf(ReferenceConverterNode);
    });

    it("should handle object type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "object",
        properties: {
          name: { type: "string" },
        },
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeInstanceOf(ObjectConverterNode);
    });

    it("should handle boolean type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "boolean",
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeDefined();
    });

    it("should handle integer type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "integer",
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeDefined();
    });

    it("should handle number type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "number",
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeDefined();
    });

    it("should handle string type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "string",
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeDefined();
    });

    it("should handle array type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "array",
        items: {
          type: "string",
        },
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeDefined();
    });

    it("should handle enum type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "string",
        enum: ["RED", "GREEN", "BLUE"],
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeDefined();
    });

    it("should handle oneOf type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        oneOf: [{ type: "string" }, { type: "number" }],
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeDefined();
    });

    it("should handle allOf type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        allOf: [
          { type: "object", properties: { name: { type: "string" } } },
          { type: "object", properties: { age: { type: "number" } } },
        ],
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.typeShapeNode).toBeDefined();
    });

    it("should set description", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "string",
        description: "test description",
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.description).toBe("test description");
    });
  });

  describe("convert", () => {
    it("should convert primitive type", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "string",
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      const result = node.convert();
      expect(result).toEqual({
        type: "alias",
        value: {
          type: "primitive",
          value: {
            type: "string",
            default: undefined,
          },
        },
      });
    });

    it("should return undefined if typeShapeNode is undefined", () => {
      const input: OpenAPIV3_1.SchemaObject = {
        type: "unknown" as OpenAPIV3_1.NonArraySchemaObjectType,
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: undefined,
        schemaName: undefined,
      });
      expect(node.convert()).toEqual({
        type: "alias",
        value: {
          type: "unknown",
          displayName: undefined,
        },
      });
    });

    it("should overwrite nullable if set to false", () => {
      const input: OpenAPIV3_1.NonArraySchemaObject = {
        type: "string",
        nullable: false,
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: true,
        schemaName: undefined,
      });
      expect(node.nullable).toBe(false);
    });

    it("should not overwrite nullable if set to false", () => {
      const input: OpenAPIV3_1.NonArraySchemaObject = {
        type: "string",
      };
      const node = new SchemaConverterNode({
        input,
        context: mockContext,
        accessPath: [],
        pathId: "test",
        seenSchemas: new Set(),
        nullable: true,
        schemaName: undefined,
      });
      expect(node.nullable).toBe(true);
    });
  });
});
