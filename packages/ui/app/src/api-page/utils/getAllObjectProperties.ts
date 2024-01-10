import { APIV1Read } from "@fern-api/fdr-sdk";

export function getAllObjectProperties(
    object: APIV1Read.ObjectType,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined
): APIV1Read.ObjectProperty[] {
    return [
        ...object.properties,
        ...object.extends.flatMap((typeId) => {
            const type = resolveTypeByIdRecursive(typeId, resolveTypeById);
            if (type?.shape.type !== "object") {
                throw new Error("Object extends non-object " + typeId);
            }
            return getAllObjectProperties(type.shape, resolveTypeById);
        }),
    ];
}

function resolveTypeByIdRecursive(
    typeId: APIV1Read.TypeId,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined
): APIV1Read.TypeDefinition | undefined {
    const type = resolveTypeById(typeId);
    if (type != null && type.shape.type === "alias" && type.shape.value.type === "id") {
        return resolveTypeByIdRecursive(type.shape.value.value, resolveTypeById);
    }
    return type;
}
