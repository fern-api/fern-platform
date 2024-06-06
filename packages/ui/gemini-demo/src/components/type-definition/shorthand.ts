import { visitDiscriminatedUnion } from "@/utils/visitDiscriminatedUnion";
import { APIV1Read } from "@fern-api/fdr-sdk";

export function getTypeShorthand(
    type: APIV1Read.TypeDefinition,
    { plural = false, withArticle = false, nullable = false }: TypeShorthandOptions = {
        plural: false,
        withArticle: false,
        nullable: false,
    },
    types: Record<string, ResolvedTypeDefinition>,
): string {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;
    return visitDiscriminatedUnion(type.shape)._visit({
        object: () => {
            if (plural) {
                return "dictionaries";
            }
            return "dictionary";
        },
        alias: (alias) =>
            visitDiscriminatedUnion(alias.value)._visit({
                id(value: APIV1Read.TypeReference.Id): "dictionaries" | "dictionary" {
                    throw new Error("Function not implemented.");
                },
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
                        _other: () => "<unknown>",
                    }),
                optional(value: APIV1Read.TypeReference.Optional): "dictionaries" | "dictionary" {
                    throw new Error("Function not implemented.");
                },
                list(value: APIV1Read.TypeReference.List): "dictionaries" | "dictionary" {
                    throw new Error("Function not implemented.");
                },
                set(value: APIV1Read.TypeReference.Set): "dictionaries" | "dictionary" {
                    throw new Error("Function not implemented.");
                },
                map(value: APIV1Read.TypeReference.Map): "dictionaries" | "dictionary" {
                    throw new Error("Function not implemented.");
                },
                literal(value: APIV1Read.TypeReference.Literal): "dictionaries" | "dictionary" {
                    throw new Error("Function not implemented.");
                },
                unknown(value: APIV1Read.TypeReference.Unknown): "dictionaries" | "dictionary" {
                    throw new Error("Function not implemented.");
                },
            }),
        enum(value: APIV1Read.TypeShape.Enum): string {
            throw new Error("Function not implemented.");
        },
        undiscriminatedUnion(value: APIV1Read.TypeShape.UndiscriminatedUnion): string {
            throw new Error("Function not implemented.");
        },
        discriminatedUnion(value: APIV1Read.TypeShape.DiscriminatedUnion): string {
            throw new Error("Function not implemented.");
        },
    });
}
