import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import clsx from "clsx";
import { ReactNode } from "react";
import {
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    unwrapAlias,
    unwrapOptional,
    unwrapReference,
} from "../../../resolver/types";
import { unknownToString } from "../../../util/unknownToString";

export interface TypeShorthandOptions {
    plural?: boolean;
    withArticle?: boolean;
    nullable?: boolean; // determines whether to render "Optional" or "Nullable"
}

export function renderTypeShorthandRoot(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
    isResponse: boolean = false,
    className?: string,
): ReactNode {
    const typeShorthand = renderTypeShorthand(unwrapOptional(shape, types), { nullable: isResponse }, types);
    const unaliasedShape = unwrapAlias(shape, types);
    return (
        <span className={clsx("text-inherit inline-flex items-baseline gap-2 text-xs", className)}>
            <span>{typeShorthand}</span>
            {unaliasedShape.type === "optional" ? (
                <span>{isResponse ? "Optional" : "Optional"}</span>
            ) : !isResponse ? (
                <span className="t-danger">Required</span>
            ) : null}
            {unaliasedShape.type === "optional" && unaliasedShape.defaultValue !== undefined && (
                <span>{renderDefaultTo(unaliasedShape.defaultValue)}</span>
            )}
        </span>
    );
}

function renderDefaultTo(defaultsTo: unknown): string {
    return `Defaults to ${unknownToString(defaultsTo)}`;
}

export function renderTypeShorthand(
    shape: ResolvedTypeShape,
    { plural = false, withArticle = false, nullable = false }: TypeShorthandOptions = {
        plural: false,
        withArticle: false,
        nullable: false,
    },
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
        object: () => (plural ? "objects" : maybeWithArticle("an", "object")),
        undiscriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
        discriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
        enum: () => (plural ? "enums" : maybeWithArticle("an", "enum")),

        // containing shapes
        optional: (optional) =>
            `${maybeWithArticle("an", nullable ? "optional" : "optional")} ${renderTypeShorthand(optional.shape, { plural }, types)}`,
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
