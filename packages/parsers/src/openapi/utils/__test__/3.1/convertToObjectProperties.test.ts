import { FernRegistry } from "../../../../client/generated";
import { SchemaConverterNode } from "../../../3.1";
import { AvailabilityConverterNode } from "../../../3.1/extensions/AvailabilityConverter.node";
import { createMockContext } from "../../../__test__/createMockContext.util";
import { convertToObjectProperties } from "../../3.1/convertToObjectProperties";

describe("convertToObjectProperties", () => {
  const mockContext = createMockContext();

  it("should return undefined when properties is undefined", () => {
    expect(convertToObjectProperties(undefined, undefined)).toBeUndefined();
  });

  it("should convert properties to object properties", () => {
    const mockTypeShape: FernRegistry.api.latest.TypeShape = {
      type: "alias",
      value: {
        type: "primitive",
        value: {
          type: "string",
          regex: undefined,
          minLength: undefined,
          maxLength: undefined,
          default: undefined,
        },
      },
    };

    const mockAvailabilityShape: FernRegistry.Availability = "Deprecated";

    const nameSchemaConverterNode = new SchemaConverterNode({
      input: {
        type: "string",
        description: "The name",
      },
      context: mockContext,
      accessPath: [],
      pathId: "",
      seenSchemas: new Set(),
    });
    nameSchemaConverterNode.availability = new AvailabilityConverterNode({
      input: {
        deprecated: true,
      },
      context: mockContext,
      accessPath: [],
      pathId: "",
    });

    const properties = {
      name: nameSchemaConverterNode,
      age: new SchemaConverterNode({
        input: {
          type: "string",
        },
        context: mockContext,
        accessPath: [],
        pathId: "",
        seenSchemas: new Set(),
      }),
    };

    const result = convertToObjectProperties(properties, undefined);

    expect(result).toEqual([
      [
        {
          key: FernRegistry.PropertyKey("name"),
          valueShape: mockTypeShape,
          description: "The name",
          availability: mockAvailabilityShape,
        },
        {
          key: FernRegistry.PropertyKey("age"),
          valueShape: mockTypeShape,
          description: undefined,
          availability: undefined,
        },
      ],
    ]);
  });

  it("should filter out properties with null value shapes", () => {
    const mockTypeShape: FernRegistry.api.latest.TypeShape = {
      type: "alias",
      value: {
        type: "primitive",
        value: {
          type: "string",
          regex: undefined,
          minLength: undefined,
          maxLength: undefined,
          default: undefined,
        },
      },
    };

    const validSchemaConverterNode = new SchemaConverterNode({
      input: {
        type: "string",
      },
      context: mockContext,
      accessPath: [],
      pathId: "",
      seenSchemas: new Set(),
    });

    const properties = {
      valid: validSchemaConverterNode,
      invalid: {
        convert: () => undefined,
      } as unknown as SchemaConverterNode,
    };

    const result = convertToObjectProperties(properties, undefined);

    expect(result).toEqual([
      [
        {
          key: FernRegistry.PropertyKey("valid"),
          valueShape: mockTypeShape,
          description: undefined,
          availability: undefined,
        },
      ],
    ]);
  });
});
