import { OpenAPIV3_1 } from "openapi-types";
import { createMockContext } from "../../../../__test__/createMockContext.util";
import { ParameterBaseObjectConverterNode } from "../../parameters/ParameterBaseObjectConverter.node";

describe("ParameterBaseObjectConverterNode", () => {
  const mockContext = createMockContext();

  it("should handle reference objects", () => {
    const input = {
      $ref: "#/components/parameters/PetId",
    };

    mockContext.document.components ??= {};
    mockContext.document.components.parameters = {
      PetId: {
        name: "petId",
        in: "path",
        schema: { type: "integer" },
      },
    };

    const converter = new ParameterBaseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
      parameterName: undefined,
    });

    expect(converter.schema).toBeDefined();
    expect(converter.availability).toBeDefined();
    expect(converter.required).toBeUndefined();
  });

  it("should handle parameter objects with schema", () => {
    const input = {
      name: "petId",
      in: "path",
      description: "ID of pet",
      required: true,
      schema: {
        type: "integer" as const,
        format: "int64",
      },
    };

    const converter = new ParameterBaseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
      parameterName: undefined,
    });

    expect(converter.schema).toBeDefined();
    expect(converter.availability).toBeDefined();
    expect(converter.required).toBe(true);
    expect(converter.description).toBe("ID of pet");
  });

  it("should log error when parameter has no schema", () => {
    const input = {
      name: "petId",
      in: "path",
    } as OpenAPIV3_1.ParameterBaseObject;

    const converted = new ParameterBaseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
      parameterName: undefined,
    }).convert();

    expect(converted).toEqual({
      type: "alias",
      value: {
        type: "primitive",
        value: {
          type: "string",
        },
      },
    });
  });

  it("should return schema conversion result in convert()", () => {
    const input = {
      name: "petId",
      in: "path",
      schema: {
        type: "integer" as const,
      },
    };

    const converter = new ParameterBaseObjectConverterNode({
      input,
      context: mockContext,
      accessPath: [],
      pathId: "test",
      parameterName: undefined,
    });

    const result = converter.convert();
    expect(result).toEqual({
      type: "alias",
      value: { type: "primitive", value: { type: "integer" } },
    });
  });
});
