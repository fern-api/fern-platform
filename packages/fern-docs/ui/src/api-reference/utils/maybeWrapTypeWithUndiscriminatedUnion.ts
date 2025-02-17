import { ApiDefinition } from "@fern-api/fdr-sdk";

export function maybeWrapTypeWithUndiscriminatedUnion(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>,
  displayName?: string
): ApiDefinition.TypeShapeOrReference {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  if (
    unwrapped.shape.type !== "object" &&
    unwrapped.shape.type !== "undiscriminatedUnion" &&
    unwrapped.shape.type !== "discriminatedUnion" &&
    unwrapped.shape.type !== "enum"
  ) {
    return {
      type: "undiscriminatedUnion",
      variants: [
        {
          displayName,
          description: undefined,
          shape,
          availability: undefined,
        },
      ],
    };
  }
  return shape;
}
