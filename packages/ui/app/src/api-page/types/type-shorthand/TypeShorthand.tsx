import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import clsx from "clsx";
import { ReactNode } from "react";
import {
    DereferencedTypeShape,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    unwrapAlias,
    unwrapOptional,
    unwrapReference,
} from "../../../resolver/types";

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
    const defaultsTo = renderDefaultsTo(unaliasedShape);
    return (
        <span className={clsx("fern-api-property-meta", className)}>
            <span>{typeShorthand}</span>
            {unaliasedShape.type === "optional" ? (
                <span>{isResponse ? "Optional" : "Optional"}</span>
            ) : !isResponse ? (
                <span className="t-danger">Required</span>
            ) : null}
            {defaultsTo != null && <span>{`Defaults to ${defaultsTo}`}</span>}
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
        literal: (_literal) =>
            visitDiscriminatedUnion(_literal.value, "type")._visit({
                stringLiteral: () => "string literal",
                booleanLiteral: () => "boolean literal",
                _other: () => "<unknown>",
            }),
        // other
        unknown: () => "any",
        _other: () => "<unknown>",
        alias: (reference) => renderTypeShorthand(reference.shape, { plural, withArticle }, types),
    });
}
