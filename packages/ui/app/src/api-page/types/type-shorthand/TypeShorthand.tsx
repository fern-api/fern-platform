import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { ReactElement } from "react";
import { ReferencedTypePreviewPart } from "./ReferencedTypePreviewPart";

export declare namespace TypeShorthand {
    export interface Props {
        type: APIV1Read.TypeReference;
        plural: boolean;
        withArticle?: boolean;
    }
}

export const TypeShorthand: React.FC<TypeShorthand.Props> = ({ type, plural, withArticle = false }) => {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;

    return (
        <>
            {visitDiscriminatedUnion(type, "type")._visit<ReactElement | string>({
                id: ({ value: typeId }) => (
                    <ReferencedTypePreviewPart typeId={typeId} plural={plural} withArticle={withArticle} />
                ),
                primitive: ({ value: primitive }) => {
                    return visitDiscriminatedUnion(primitive, "type")._visit({
                        string: () => (plural ? "strings" : maybeWithArticle("a", "string")),
                        integer: () => (plural ? "integers" : maybeWithArticle("an", "integer")),
                        double: () => (plural ? "doubles" : maybeWithArticle("a", "double")),
                        long: () => (plural ? "longs" : maybeWithArticle("a", "long")),
                        boolean: () => (plural ? "booleans" : maybeWithArticle("a", "boolean")),
                        datetime: () => (plural ? "datetimes" : maybeWithArticle("a", "datetime")),
                        uuid: () => (plural ? "UUIDs" : maybeWithArticle("a", "UUID")),
                        base64: () => (plural ? "Base64 strings" : maybeWithArticle("a", "Base64 string")),
                        date: () => (plural ? "dates" : maybeWithArticle("a", "date")),
                        _other: () => "<unknown>",
                    });
                },
                optional: ({ itemType }) => (
                    <>
                        {maybeWithArticle("an", "optional")} <TypeShorthand type={itemType} plural={plural} />
                    </>
                ),
                list: ({ itemType }) => {
                    return (
                        <>
                            {plural ? "lists of" : maybeWithArticle("a", "list of")}{" "}
                            <TypeShorthand type={itemType} plural />
                        </>
                    );
                },
                set: ({ itemType }) => {
                    return (
                        <>
                            {plural ? "sets of" : maybeWithArticle("a", "set of")}{" "}
                            <TypeShorthand type={itemType} plural />
                        </>
                    );
                },
                map: ({ keyType, valueType }) => {
                    return (
                        <>
                            {plural ? "maps from " : maybeWithArticle("a", "map from ")}
                            <TypeShorthand type={keyType} plural />
                            {" to "}
                            <TypeShorthand type={valueType} plural />
                        </>
                    );
                },
                literal: (literal) =>
                    visitDiscriminatedUnion(literal.value, "type")._visit({
                        stringLiteral: (value) => `"${value.value}"`,
                        booleanLiteral: (value) => `${value.value}`,
                        _other: () => "<unknown>",
                    }),
                unknown: () => "any",
                _other: () => "<unknown>",
            })}
        </>
    );
};
