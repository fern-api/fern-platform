import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { ReactNode } from "react";
import { ResolvedTypeDefinition, ResolvedTypeShape, unwrapReference } from "../../../util/resolver";

export interface TypeShorthandOptions {
    plural?: boolean;
    withArticle?: boolean;
}

export function renderTypeShorthandWithRequired(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): ReactNode {
    const typeShorthand = renderTypeShorthand(shape, undefined, types);
    if (shape.type === "optional") {
        return typeShorthand;
    }
    return (
        <>
            <span className="text-intent-danger">required</span> {typeShorthand}
        </>
    );
}

export function renderTypeShorthand(
    shape: ResolvedTypeShape,
    { plural = false, withArticle = false }: TypeShorthandOptions = { plural: false, withArticle: false },
    types: Record<string, ResolvedTypeDefinition>,
): string {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;
    return visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit({
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
        object: (o) =>
            plural
                ? `${o.name != null ? o.name + " " : ""} objects`
                : `${o.name != null ? maybeWithArticle("a", `${o.name} object`) : maybeWithArticle("an", "object")}`,
        undiscriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
        discriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
        enum: () => (plural ? "enums" : maybeWithArticle("an", "enum")),

        // containing shapes
        optional: (optional) =>
            `${maybeWithArticle("an", "optional")} ${renderTypeShorthand(optional.shape, { plural }, types)}`,
        list: (list) =>
            `${plural ? "lists of" : maybeWithArticle("a", "list of")} ${renderTypeShorthand(
                list.shape,
                { plural: true },
                types,
            )}`,
        set: (set) =>
            `${plural ? "sets of" : maybeWithArticle("a", "set of")} ${renderTypeShorthand(
                set.shape,
                { plural: true },
                types,
            )}`,
        map: (map) =>
            `${plural ? "maps from" : maybeWithArticle("a", "map from")} ${renderTypeShorthand(
                map.keyShape,
                { plural: true },
                types,
            )} to ${renderTypeShorthand(map.valueShape, { plural: true }, types)}`,

        // literals
        stringLiteral: (value) => `"${value.value}"`,
        booleanLiteral: (value) => `${value.value}`,

        // other
        unknown: () => "any",
        _other: () => "<unknown>",
        alias: (reference) => renderTypeShorthand(reference.shape, { plural, withArticle }, types),
    });
}
