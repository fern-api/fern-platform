import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";

export function typeShapeHasChildren(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>,
  parentVisitedTypeIds = new Set<ApiDefinition.TypeId>()
): boolean {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  const visitedTypeIds = new Set([
    ...parentVisitedTypeIds,
    ...unwrapped.visitedTypeIds,
  ]);
  switch (unwrapped.shape.type) {
    case "object":
      return (
        ApiDefinition.unwrapObjectType(unwrapped.shape, types, visitedTypeIds)
          .properties.length > 0 || !!unwrapped.shape.extraProperties
      );
    case "discriminatedUnion":
    case "undiscriminatedUnion":
      return unwrapped.shape.variants.length > 0;
    case "list":
    case "set":
      return typeShapeHasChildren(
        unwrapped.shape.itemShape,
        types,
        visitedTypeIds
      );
    case "map":
      return typeShapeHasChildren(
        unwrapped.shape.valueShape,
        types,
        visitedTypeIds
      );
    case "enum":
      return unwrapped.shape.values.length > 0;
    default:
      return false;
  }
}

export function showChildAttributesMessage(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>,
  parentVisitedTypeIds = new Set<ApiDefinition.TypeId>()
): string | undefined {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  const visitedTypeIds = new Set([
    ...parentVisitedTypeIds,
    ...unwrapped.visitedTypeIds,
  ]);
  switch (unwrapped.shape.type) {
    case "object": {
      const properties = ApiDefinition.unwrapObjectType(
        unwrapped.shape,
        types,
        visitedTypeIds
      ).properties;
      return `Show ${properties.length} child attribute${
        properties.length > 1 ? "s" : ""
      }`;
    }
    case "discriminatedUnion":
    case "undiscriminatedUnion":
      return `Show ${unwrapped.shape.variants.length} variant${
        unwrapped.shape.variants.length > 1 ? "s" : ""
      }`;
    case "list":
    case "set":
      return showChildAttributesMessage(
        unwrapped.shape.itemShape,
        types,
        visitedTypeIds
      );
    case "map":
      return showChildAttributesMessage(
        unwrapped.shape.valueShape,
        types,
        visitedTypeIds
      );
    case "enum":
      return `Show ${unwrapped.shape.values.length} enum value${
        unwrapped.shape.values.length > 1 ? "s" : ""
      }`;
    default:
      return undefined;
  }
}

export function isTypeShapeDetailsOpenByDefault(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>
) {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);

  switch (unwrapped.shape.type) {
    case "enum":
      return unwrapped.shape.values.length === 1;
    case "list":
    case "set":
      return isTypeShapeDetailsOpenByDefault(unwrapped.shape.itemShape, types);
    case "map":
      return isTypeShapeDetailsOpenByDefault(unwrapped.shape.valueShape, types);
    case "discriminatedUnion":
    case "undiscriminatedUnion":
      return unwrapped.shape.variants.length === 1;
    case "object":
      return (
        ApiDefinition.unwrapObjectType(unwrapped.shape, types).properties
          .length === 1
      );
    default:
      return false;
  }
}

export function collectExpectedTypeIds(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>
): Set<ApiDefinition.TypeId> {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  switch (unwrapped.shape.type) {
    case "list":
    case "set":
      return new Set([
        ...unwrapped.visitedTypeIds,
        ...collectExpectedTypeIds(unwrapped.shape.itemShape, types),
      ]);
    case "map":
      return new Set([
        ...unwrapped.visitedTypeIds,
        ...collectExpectedTypeIds(unwrapped.shape.valueShape, types),
      ]);
    case "undiscriminatedUnion":
      return unwrapped.visitedTypeIds;
    // return new Set([
    //   ...unwrapped.visitedTypeIds,
    //   ...unwrapped.shape.variants.reduce((acc, variant) => {
    //     return new Set([
    //       ...acc,
    //       ...collectExpectedTypeIds(variant.shape, types),
    //     ]);
    //   }, new Set<ApiDefinition.TypeId>()),
    // ]);
    default:
      return unwrapped.visitedTypeIds;
  }
}
