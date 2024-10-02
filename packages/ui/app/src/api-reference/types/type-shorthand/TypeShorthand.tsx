import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { uniq } from "lodash-es";
import { ReactNode } from "react";
import {
    DereferencedTypeShape,
    ResolvedFormDataRequestProperty,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    ResolvedUnknownTypeShape,
    unwrapAlias,
    unwrapOptional,
    unwrapReference,
} from "../../../resolver/types";

export interface TypeShorthandOptions {
    plural?: boolean;
    withArticle?: boolean;
    nullable?: boolean; // determines whether to render "Optional" or "Nullable"
}

/**
 * @deprecated
 */
export function renderDeprecatedTypeShorthandRoot(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
    isResponse: boolean = false,
): ReactNode {
    const typeShorthand = renderDeprecatedTypeShorthand(unwrapOptional(shape, types), { nullable: isResponse }, types);
    const unaliasedShape = unwrapAlias(shape, types);
    const defaultsTo = renderDefaultsTo(unaliasedShape);
    return (
        <span className="fern-api-property-meta">
            <span>{typeShorthand}</span>
            {unaliasedShape.type === "optional" ? (
                <span>Optional</span>
            ) : !isResponse ? (
                <span className="t-danger">Required</span>
            ) : null}
            {defaultsTo != null && (
                <span>
                    {"Defaults to "}
                    <code>{defaultsTo}</code>
                </span>
            )}
        </span>
    );
}

/**
 * @deprecated
 */
export function renderDeprecatedTypeShorthandFormDataProperty(
    property: Exclude<ResolvedFormDataRequestProperty, ResolvedFormDataRequestProperty.BodyProperty>,
): ReactNode {
    return (
        <span className="fern-api-property-meta">
            <span>{property.type === "file" ? "file" : property.type === "fileArray" ? "files" : "unknown"}</span>
            {property.isOptional ? <span>Optional</span> : <span className="t-danger">Required</span>}
        </span>
    );
}

function renderDefaultsTo(shape: DereferencedTypeShape): string | undefined {
    if (shape.type !== "optional") {
        return undefined;
    }

    if (shape.shape.type === "primitive") {
        return renderDefaultToPrimitive(shape.shape.value);
    }

    if (shape.shape.type === "enum") {
        return shape.shape.default;
    }

    return undefined;
}

function renderDefaultToPrimitive(shape: APIV1Read.PrimitiveType): string | undefined {
    return visitDiscriminatedUnion(shape, "type")._visit<string | undefined>({
        string: (value) => value.default,
        integer: (value) => value.default?.toString(),
        double: (value) => value.default?.toString(),
        uint: () => undefined,
        uint64: () => undefined,
        boolean: (value) => value.default?.toString(),
        long: (value) => value.default?.toString(),
        datetime: (datetime) => datetime.default,
        uuid: (uuid) => uuid.default,
        base64: (base64) => base64.default,
        date: (value) => value.default,
        bigInteger: (value) => value.default,
        _other: () => undefined,
    });
}

/**
 * @deprecated
 */
export function renderDeprecatedTypeShorthand(
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
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit({
                string: () => (plural ? "strings" : maybeWithArticle("a", "string")),
                integer: () => (plural ? "integers" : maybeWithArticle("an", "integer")),
                uint: () => (plural ? "uints" : maybeWithArticle("a", "uint")),
                uint64: () => (plural ? "uint64s" : maybeWithArticle("a", "uint64")),
                double: () => (plural ? "doubles" : maybeWithArticle("a", "double")),
                long: () => (plural ? "longs" : maybeWithArticle("a", "long")),
                boolean: () => (plural ? "booleans" : maybeWithArticle("a", "boolean")),
                datetime: () => (plural ? "datetimes" : maybeWithArticle("a", "datetime")),
                uuid: () => (plural ? "UUIDs" : maybeWithArticle("a", "UUID")),
                base64: () => (plural ? "Base64 strings" : maybeWithArticle("a", "Base64 string")),
                date: () => (plural ? "dates" : maybeWithArticle("a", "date")),
                bigInteger: () => (plural ? "big integers" : maybeWithArticle("a", "big integer")),
                _other: () => "<unknown>",
            }),

        // referenced shapes
        object: () => (plural ? "objects" : maybeWithArticle("an", "object")),
        undiscriminatedUnion: (union) => {
            return uniq(
                union.variants.map((variant) =>
                    renderDeprecatedTypeShorthand(variant.shape, { plural, withArticle }, types),
                ),
            ).join(" or ");
        },
        discriminatedUnion: () => (plural ? "objects" : maybeWithArticle("an", "object")),
        enum: (enumValue) => {
            // if there are only 1 or 2 values, we can list them like literals (e.g. "apple" or "banana")
            if (enumValue.values.length > 0 && enumValue.values.length < 3) {
                return enumValue.values.map((value) => `"${value.value}"`).join(" or ");
            }
            return plural ? "enums" : maybeWithArticle("an", "enum");
        },

        // containing shapes
        optional: (optional) =>
            `${maybeWithArticle("an", nullable ? "optional" : "optional")} ${renderDeprecatedTypeShorthand(optional.shape, { plural }, types)}`,
        list: (list) =>
            `${plural ? "lists of" : maybeWithArticle("a", "list of")} ${renderDeprecatedTypeShorthand(
                list.shape,
                { plural: true },
                types,
            )}`,
        set: (set) =>
            `${plural ? "sets of" : maybeWithArticle("a", "set of")} ${renderDeprecatedTypeShorthand(
                set.shape,
                { plural: true },
                types,
            )}`,
        map: (map) =>
            `${plural ? "maps from" : maybeWithArticle("a", "map from")} ${renderDeprecatedTypeShorthand(
                map.keyShape,
                { plural: true },
                types,
            )} to ${renderDeprecatedTypeShorthand(map.valueShape, { plural: true }, types)}`,

        // literals
        literal: (literal) =>
            visitDiscriminatedUnion(literal.value, "type")._visit({
                stringLiteral: ({ value }) => `"${value}"`,
                booleanLiteral: ({ value }) => value.toString(),
                _other: () => "<unknown>",
            }),
        // other
        unknown: (unknown: ResolvedUnknownTypeShape) => {
            return unknown.displayName ?? "any";
        },
        _other: () => "<unknown>",
        alias: (reference) => renderDeprecatedTypeShorthand(reference.shape, { plural, withArticle }, types),
    });
}
