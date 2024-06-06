import { visitDiscriminatedUnion } from "@/utils/visitDiscriminatedUnion";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { camelCase, capitalize } from "lodash-es";

export interface TypeShorthandOptions {
    plural?: boolean;
    withArticle?: boolean;
    nullable?: boolean; // determines whether to render "Optional" or "Nullable"
}

function getTypeReferenceShorthandTypescript(
    typeReference: APIV1Read.TypeReference,
    { withArticle = false, nullable = false }: TypeShorthandOptions = {
        withArticle: false,
        nullable: false,
    },
    types: Record<string, APIV1Read.TypeDefinition>,
): string {
    return visitDiscriminatedUnion(typeReference)._visit({
        id: ({ value: id }) => getTypeDefinitionShorthandTypescript(types[id], { withArticle, nullable }, types),
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit({
                string: () => "string",
                integer: () => "number",
                double: () => "number",
                long: () => "number",
                boolean: () => "boolean",
                datetime: () => "Date",
                uuid: () => "string",
                base64: () => "string",
                date: () => "Date",
            }),
        optional: ({ itemType }) =>
            `${getTypeReferenceShorthandTypescript(itemType, { withArticle, nullable: true }, types)} | undefined`,
        list: ({ itemType }) =>
            `Array<${getTypeReferenceShorthandTypescript(itemType, { withArticle, nullable }, types)}>`,
        set: ({ itemType }) =>
            `Set<${getTypeReferenceShorthandTypescript(itemType, { withArticle, nullable }, types)}>`,
        map: ({ keyType, valueType }) =>
            `Record<${getTypeReferenceShorthandTypescript(keyType, { withArticle, nullable }, types)}, ${getTypeReferenceShorthandTypescript(valueType, { withArticle, nullable }, types)}>`,
        literal: ({ value }) =>
            visitDiscriminatedUnion(value)._visit({
                booleanLiteral: ({ value }) => (value ? "true" : "false"),
                stringLiteral: ({ value }) => `"${value}"`,
            }),
        unknown: () => "any",
    });
}

export function getTypeDefinitionShorthandTypescript(
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
        alias: (alias) => getTypeReferenceShorthandTypescript(alias.value, { plural, withArticle, nullable }, types),
        enum: (enum_) => enum_.values.map((value) => value.value).join(" | "),
        undiscriminatedUnion: (union) =>
            union.variants
                .map((variant) =>
                    variant.displayName != null
                        ? capitalize(camelCase(variant.displayName))
                        : getTypeReferenceShorthandTypescript(variant.type, { withArticle, nullable }, types),
                )
                .join(" | "),
        discriminatedUnion: (union) =>
            union.variants
                .map(
                    (variant) =>
                        `${capitalize(camelCase(type.name))}.${capitalize(camelCase(variant.discriminantValue))}`,
                )
                .join(" | "),
    });
}
