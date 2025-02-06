import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { sortBy } from "es-toolkit/array";

export function getAllObjectProperties(
  object: APIV1Read.ObjectType,
  resolveTypeById: (
    typeId: APIV1Read.TypeId
  ) => APIV1Read.TypeDefinition | undefined
): APIV1Read.ObjectProperty[] {
  const extendedProperties = object.extends.flatMap((typeId) => {
    const type = resolveTypeByIdRecursive(typeId, resolveTypeById);
    if (type?.shape.type !== "object") {
      console.error("Object extends non-object", typeId);
      return [];
    }
    return getAllObjectProperties(type.shape, resolveTypeById);
  });
  if (extendedProperties.length === 0) {
    return object.properties;
  }
  const propertyKeys = new Set(
    object.properties.map((property) => property.key)
  );
  const filteredExtendedProperties = extendedProperties.filter(
    (extendedProperty) => !propertyKeys.has(extendedProperty.key)
  );
  return sortBy(
    [...object.properties, ...filteredExtendedProperties],
    [(property) => property.key]
  );
}

function resolveTypeByIdRecursive(
  typeId: APIV1Read.TypeId,
  resolveTypeById: (
    typeId: APIV1Read.TypeId
  ) => APIV1Read.TypeDefinition | undefined
): APIV1Read.TypeDefinition | undefined {
  const type = resolveTypeById(typeId);
  if (type?.shape.type === "alias" && type.shape.value.type === "id") {
    return resolveTypeByIdRecursive(type.shape.value.value, resolveTypeById);
  }
  return type;
}
