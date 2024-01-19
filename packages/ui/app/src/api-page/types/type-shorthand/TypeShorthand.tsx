import { ResolvedTypeReference } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";

export interface TypeShorthandOptions {
    plural?: boolean;
    withArticle?: boolean;
}

export function renderTypeShorthand(
    shape: ResolvedTypeReference,
    { plural = false, withArticle = false }: TypeShorthandOptions = { plural: false, withArticle: false }
): string {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;
    return visitDiscriminatedUnion(shape, "type")._visit({
        // primitives
        string: () => (plural ? "strings" : maybeWithArticle("a", "string")),
        integer: () => (plural ? "integers" : maybeWithArticle("an", "integer")),
        double: () => (plural ? "doubles" : maybeWithArticle("a", "double")),
        long: () => (plural ? "longs" : maybeWithArticle("a", "long")),
        boolean: () => (plural ? "booleans" : maybeWithArticle("a", "boolean")),
        datetime: () => (plural ? "datetimes" : maybeWithArticle("a", "datetime")),
        uuid: () => (plural ? "UUIDs" : maybeWithArticle("a", "UUID")),
        base64: () => (plural ? "Base64 strings" : maybeWithArticle("a", "Base64 string")),
        date: () => (plural ? "dates" : maybeWithArticle("a", "date")),

        // referenced shapes
        object: () => (plural ? "objects" : maybeWithArticle("an", "object")),
        undiscriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
        discriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
        enum: () => (plural ? "enums" : maybeWithArticle("an", "enum")),

        // containing shapes
        optional: (optional) =>
            `${maybeWithArticle("an", "optional")} ${renderTypeShorthand(optional.shape, { plural })}`,
        list: (list) =>
            `${plural ? "lists of" : maybeWithArticle("a", "list of")} ${renderTypeShorthand(list.shape, {
                plural: true,
            })}`,
        set: (set) =>
            `${plural ? "sets of" : maybeWithArticle("a", "set of")} ${renderTypeShorthand(set.shape, {
                plural: true,
            })}`,
        map: (map) =>
            `${plural ? "maps from" : maybeWithArticle("a", "map from")} ${renderTypeShorthand(map.keyShape, {
                plural: true,
            })} to ${renderTypeShorthand(map.valueShape, { plural: true })}`,

        // literals
        stringLiteral: (value) => `"${value.value}"`,
        booleanLiteral: (value) => `${value.value}`,

        // other
        unknown: () => "any",
        _other: () => "<unknown>",
        reference: (reference) => renderTypeShorthand(reference.shape(), { plural, withArticle }),
    });
}
