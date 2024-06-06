import { visitDiscriminatedUnion } from "@/utils/visitDiscriminatedUnion";
import { APIV1Read } from "@fern-api/fdr-sdk";

export interface TypeShorthandOptions {
    plural?: boolean;
    withArticle?: boolean;
    nullable?: boolean; // determines whether to render "Optional" or "Nullable"
}

function getTypeReferenceShorthand(
    typeReference: APIV1Read.TypeReference,
    { plural = false, withArticle = false, nullable = false }: TypeShorthandOptions = {
        plural: false,
        withArticle: false,
        nullable: false,
    },
    types: Record<string, APIV1Read.TypeDefinition>,
): string {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;
    return visitDiscriminatedUnion(typeReference)._visit({
        id: ({ value: id }) => getTypeDefinitionShorthand(types[id], { plural, withArticle, nullable }, types),
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit({
                string: () => (plural ? "strings" : maybeWithArticle("a", "string")),
                integer: () => (plural ? "integers" : maybeWithArticle("an", "integer")),
                double: () => (plural ? "doubles" : maybeWithArticle("a", "double")),
                long: () => (plural ? "longs" : maybeWithArticle("a", "long")),
                boolean: () => (plural ? "booleans" : maybeWithArticle("a", "boolean")),
                datetime: () => (plural ? "datetimes" : maybeWithArticle("a", "datetime")),
                uuid: () => (plural ? "UUIDs" : maybeWithArticle("a", "UUID")),
                base64: () => (plural ? "Base64 strings" : maybeWithArticle("a", "Base64 string")),
                date: () => (plural ? "dates" : maybeWithArticle("a", "date")),
            }),
        optional: ({ itemType }) => getTypeReferenceShorthand(itemType, { plural, withArticle, nullable: true }, types),
        list: ({ itemType }) =>
            `${plural ? "lists of" : maybeWithArticle("a", "list of")} ${getTypeReferenceShorthand(itemType, { plural: true, withArticle: false, nullable: false }, types)}`,
        set: ({ itemType }) =>
            `${plural ? "sets of" : maybeWithArticle("a", "set of")} ${getTypeReferenceShorthand(itemType, { plural: true, withArticle: false, nullable: false }, types)}`,
        map: ({ keyType, valueType }) =>
            `${plural ? "maps from" : maybeWithArticle("a", "map from")} ${getTypeReferenceShorthand(keyType, { plural: true, withArticle: false, nullable: false }, types)} to ${getTypeReferenceShorthand(valueType, { plural: true, withArticle: false, nullable: false }, types)}`,
        literal: ({ value }) =>
            visitDiscriminatedUnion(value)._visit({
                booleanLiteral: ({ value }) => (value ? "true" : "false"),
                stringLiteral: ({ value }) => `"${value}"`,
            }),
        unknown: () => "any",
    });
}

export function getTypeDefinitionShorthand(
    type: APIV1Read.TypeDefinition,
    { plural = false, withArticle = false, nullable = false }: TypeShorthandOptions = {
        plural: false,
        withArticle: false,
        nullable: false,
    },
    types: Record<string, APIV1Read.TypeDefinition>,
): string {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;
    return visitDiscriminatedUnion(type.shape)._visit({
        object: () => (plural ? "dictionaries" : maybeWithArticle("a", "dictionary")),
        alias: (alias) => getTypeReferenceShorthand(alias.value, { plural, withArticle, nullable }, types),
        enum: () => (plural ? "enums" : maybeWithArticle("an", "enum")),
        undiscriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
        discriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
    });
}
