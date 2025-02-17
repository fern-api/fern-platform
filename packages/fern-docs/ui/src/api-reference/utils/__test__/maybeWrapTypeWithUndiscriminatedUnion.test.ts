import { ApiDefinition } from "@fern-api/fdr-sdk";
import { maybeWrapTypeWithUndiscriminatedUnion } from "../maybeWrapTypeWithUndiscriminatedUnion";

describe("maybeWrapTypeWithUndiscriminatedUnion", () => {
  const types: Record<string, ApiDefinition.TypeDefinition> = {};

  it("wraps primitive types in undiscriminated union", () => {
    const stringShape: ApiDefinition.TypeShape = {
      type: "alias",
      value: {
        type: "primitive",
        value: {
          type: "string",
          format: undefined,
          regex: undefined,
          minLength: undefined,
          maxLength: undefined,
          default: undefined,
        },
      },
    };

    const result = maybeWrapTypeWithUndiscriminatedUnion(
      stringShape,
      types,
      "String Type"
    );

    expect(result).toEqual({
      type: "undiscriminatedUnion",
      variants: [
        {
          displayName: "String Type",
          description: undefined,
          shape: stringShape,
          availability: undefined,
        },
      ],
    });
  });

  it("does not wrap object types", () => {
    const objectShape: ApiDefinition.TypeShape = {
      type: "object",
      properties: [],
      extends: [],
      extraProperties: undefined,
    };

    const result = maybeWrapTypeWithUndiscriminatedUnion(objectShape, types);

    expect(result).toBe(objectShape);
  });

  it("does not wrap enum types", () => {
    const enumShape: ApiDefinition.TypeShape = {
      type: "enum",
      values: [],
      default: undefined,
    };

    const result = maybeWrapTypeWithUndiscriminatedUnion(enumShape, types);

    expect(result).toBe(enumShape);
  });

  it("does not wrap discriminated union types", () => {
    const unionShape: ApiDefinition.TypeShape = {
      type: "discriminatedUnion",
      discriminant: ApiDefinition.PropertyKey("type"),
      variants: [],
    };

    const result = maybeWrapTypeWithUndiscriminatedUnion(unionShape, types);

    expect(result).toBe(unionShape);
  });

  it("does not wrap undiscriminated union types", () => {
    const unionShape: ApiDefinition.TypeShape = {
      type: "undiscriminatedUnion",
      variants: [],
    };

    const result = maybeWrapTypeWithUndiscriminatedUnion(unionShape, types);

    expect(result).toBe(unionShape);
  });
});
