import { unknownToString } from "@fern-api/fdr-sdk";
import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { uniq } from "lodash-es";
import { ReactNode } from "react";

export interface TypeShorthandOptions {
    plural?: boolean;
    withArticle?: boolean;
    isOptional?: boolean;
}

export function renderTypeShorthandRoot(
    shape: ApiDefinition.TypeShapeOrReference,
    types: Record<string, ApiDefinition.TypeDefinition>,
    isResponse: boolean = false,
): ReactNode {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    if (unwrapped == null) {
        return null;
    }

    const typeShorthand = renderDereferencedTypeShorthand(unwrapped.shape, types, { isOptional: unwrapped.isOptional });
    const defaultsTo = renderDefaultsTo(unwrapped);
    return (
        <span className="fern-api-property-meta">
            <span>{typeShorthand}</span>
            {unwrapped.isOptional ? (
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

export function renderTypeShorthandFormDataProperty(
    field: Exclude<ApiDefinition.FormDataField, ApiDefinition.FormDataField.Property>,
): ReactNode {
    return (
        <span className="fern-api-property-meta">
            <span>{field.type}</span>
            {field.isOptional ? <span>Optional</span> : <span className="t-danger">Required</span>}
        </span>
    );
}

function renderDefaultsTo(unwrapped: ApiDefinition.UnwrappedReference): string | undefined {
    if (!unwrapped.isOptional) {
        return undefined;
    } else {
        if (unwrapped.defaultValue == null) {
            return undefined;
        }
        return typeof unwrapped.defaultValue === "string"
            ? `"${unwrapped.defaultValue}"`
            : unknownToString(unwrapped.defaultValue);
    }
}

export function renderTypeShorthand(
    shape: ApiDefinition.TypeShapeOrReference,
    types: Record<string, ApiDefinition.TypeDefinition>,
    opts: TypeShorthandOptions = {
        plural: false,
        withArticle: false,
        isOptional: false,
    },
): string {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    return renderDereferencedTypeShorthand(unwrapped.shape, types, { ...opts, isOptional: unwrapped.isOptional });
}

function renderDereferencedTypeShorthand(
    shape: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference,
    types: Record<string, ApiDefinition.TypeDefinition>,
    { plural = false, withArticle = false, isOptional = false }: TypeShorthandOptions = {
        plural: false,
        withArticle: false,
        isOptional: false,
    },
): string {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;
    if (isOptional) {
        return `${maybeWithArticle("an", "optional")} ${renderTypeShorthand(shape, types, { plural })}`;
    }
    return visitDiscriminatedUnion(shape)._visit({
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
                _other: () => "any",
            }),

        // referenced shapes
        object: () => (plural ? "objects" : maybeWithArticle("an", "object")),
        undiscriminatedUnion: (union) => {
            return uniq(
                union.variants.map((variant) =>
                    renderTypeShorthand(variant.shape, types, {
                        plural,
                        withArticle,
                    }),
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

        list: (list) =>
            `${plural ? "lists of" : maybeWithArticle("a", "list of")} ${renderTypeShorthand(list.itemShape, types, {
                plural: true,
            })}`,
        set: (set) =>
            `${plural ? "sets of" : maybeWithArticle("a", "set of")} ${renderTypeShorthand(set.itemShape, types, {
                plural: true,
            })}`,
        map: (map) => {
            return `${plural ? "maps from" : maybeWithArticle("a", "map from")} ${renderTypeShorthand(
                map.keyShape,
                types,
                { plural: true },
            )} to ${renderTypeShorthand(map.valueShape, types, { plural: true })}`;
        },

        // literals
        literal: (literal) =>
            visitDiscriminatedUnion(literal.value, "type")._visit({
                stringLiteral: ({ value }) => `"${value}"`,
                booleanLiteral: ({ value }) => value.toString(),
                _other: () => "any",
            }),
        // other
        unknown: (unknown) => {
            return unknown.displayName ?? "any";
        },
        _other: () => "any",
    });
}
