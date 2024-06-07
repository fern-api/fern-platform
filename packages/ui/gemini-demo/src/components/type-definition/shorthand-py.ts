import { visitDiscriminatedUnion } from "@/utils/visitDiscriminatedUnion";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { camelCase, capitalize } from "lodash-es";

export interface TypeShorthandOptions {
    plural?: boolean;
    withArticle?: boolean;
    nullable?: boolean; // determines whether to render "Optional" or "Nullable"
}

function getTypeReferenceShorthandPython(
    typeReference: APIV1Read.TypeReference,
    { withArticle = false, nullable = false }: TypeShorthandOptions = {
        withArticle: false,
        nullable: false,
    },
    types: Record<string, APIV1Read.TypeDefinition>,
): string {
    return visitDiscriminatedUnion(typeReference)._visit({
        id: ({ value: id }) => getTypeDefinitionShorthandPython(types[id], { withArticle, nullable }, types),
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit({
                string: () => "str",
                integer: () => "int",
                double: () => "float",
                long: () => "int",
                boolean: () => "bool",
                datetime: () => "datetime.datetime",
                uuid: () => "str",
                base64: () => "str",
                date: () => "datetime.date",
            }),
        optional: ({ itemType }) =>
            `Optional[${getTypeReferenceShorthandPython(itemType, { withArticle, nullable: true }, types)}]`,
        list: ({ itemType }) =>
            `List[${getTypeReferenceShorthandPython(itemType, { withArticle, nullable }, types)}]`,
        set: ({ itemType }) =>
            `Set[${getTypeReferenceShorthandPython(itemType, { withArticle, nullable }, types)}]`,
        map: ({ keyType, valueType }) =>
            `Dict[${getTypeReferenceShorthandPython(keyType, { withArticle, nullable }, types)}, ${getTypeReferenceShorthandPython(valueType, { withArticle, nullable }, types)}]`,
        literal: ({ value }) =>
            visitDiscriminatedUnion(value)._visit({
                booleanLiteral: ({ value }) => (value ? "True" : "False"),
                stringLiteral: ({ value }) => `"${value}"`,
            }),
        unknown: () => "Any",
    });
}

export function getTypeDefinitionShorthandPython(
    type: APIV1Read.TypeDefinition,
    { plural = false, withArticle = false, nullable = false }: TypeShorthandOptions = {
        plural: false,
        withArticle: false,
        nullable: false,
    },
    types: Record<string, APIV1Read.TypeDefinition>,
): string {
    return visitDiscriminatedUnion(type.shape)._visit({
        object: () => capitalize(camelCase(type.name)),
        alias: (alias) => getTypeReferenceShorthandPython(alias.value, { plural, withArticle, nullable }, types),
        enum: () => "Enum",
        undiscriminatedUnion: (union) =>
            `Union[${union.variants
                .map((variant) =>
                    variant.displayName != null
                        ? capitalize(camelCase(variant.displayName))
                        : getTypeReferenceShorthandPython(variant.type, { withArticle, nullable }, types),
                )
                .join(", ")}]`,
        discriminatedUnion: (union) =>
            `Union[${union.variants
                .map(
                    (variant) =>
                        `${capitalize(camelCase(type.name))}.${capitalize(camelCase(variant.discriminantValue))}`,
                )
                .join(", ")}]`,
    });
}
