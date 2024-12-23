import {
  PrimitiveType,
  TypeDefinition,
  TypeShapeOrReference,
  unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import {
  unknownToString,
  visitDiscriminatedUnion,
} from "@fern-api/ui-core-utils";
import { uniq } from "es-toolkit/array";
import { ReactNode } from "react";

export interface TypeShorthandOptions {
  plural?: boolean;
  withArticle?: boolean;
  nullable?: boolean; // determines whether to render "Optional" or "Nullable"
}

export function renderTypeShorthandRoot(
  shape: TypeShapeOrReference,
  types: Record<string, TypeDefinition>,
  isResponse = false,
  hideOptional = false
): ReactNode {
  const unwrapped = unwrapReference(shape, types);
  const typeShorthand = renderTypeShorthand(
    unwrapped.shape,
    { nullable: isResponse },
    types
  );
  return (
    <span className="fern-api-property-meta">
      <span>{typeShorthand}</span>
      {unwrapped.isOptional ? (
        !hideOptional ? (
          <span>Optional</span>
        ) : (
          false
        )
      ) : !isResponse ? (
        <span className="t-danger">Required</span>
      ) : (
        false
      )}
      {unwrapped.shape.type === "primitive" &&
        toPrimitiveTypeLabels({ primitive: unwrapped.shape.value }).map(
          (label, index) => <code key={index}>{label}</code>
        )}
      {unwrapped.default != null && unwrapped.isOptional && (
        <span>
          {"Defaults to "}
          <code>{unknownToString(unwrapped.default)}</code>
        </span>
      )}
    </span>
  );
}

function toPrimitiveTypeLabels({
  primitive,
}: {
  primitive: PrimitiveType;
}): string[] {
  switch (primitive.type) {
    case "integer":
    case "long":
    case "double":
      return toPrimitiveTypeLabelsNumeric(
        primitive,
        primitive.type === "double"
      );
    case "string":
      return toPrimitiveTypeLabelsString(primitive);
    default:
      return [];
  }
}

function numberToString(value: number, isDouble = false): string {
  return isDouble ? String(value) : String(Math.floor(value));
}

function toPrimitiveTypeLabelsNumeric(
  {
    minimum,
    maximum,
  }: {
    minimum: number | undefined;
    maximum: number | undefined;
  },
  isDouble: boolean
): string[] {
  const labels = [];

  if (minimum != null && maximum != null && minimum === maximum) {
    labels.push(`=${numberToString(minimum, isDouble)}`);
  } else {
    if (minimum != null) {
      labels.push(`>=${numberToString(minimum, isDouble)}`);
    }

    if (maximum != null) {
      labels.push(`<=${numberToString(maximum, isDouble)}`);
    }
  }

  return labels;
}

function toPrimitiveTypeLabelsString({
  minLength,
  maxLength,
  regex,
}: {
  minLength: number | undefined;
  maxLength: number | undefined;
  regex: string | undefined;
}): string[] {
  const labels = [];

  if (regex != null) {
    labels.push(`format: "${regex}"`);
  }

  if (minLength != null && maxLength != null && minLength === maxLength) {
    labels.push(
      `=${numberToString(minLength)} character${minLength === 1 ? "" : "s"}`
    );
  } else {
    if (minLength != null) {
      labels.push(
        `>=${numberToString(minLength)} character${minLength === 1 ? "" : "s"}`
      );
    }

    if (maxLength != null) {
      labels.push(
        `<=${numberToString(maxLength)} character${maxLength === 1 ? "" : "s"}`
      );
    }
  }

  return labels;
}

// export function renderTypeShorthandFormDataProperty(
//     property: Exclude<FormDataRequestProperty, FormDataRequestProperty.BodyProperty>,
// ): ReactNode {
//     return (
//         <span className="fern-api-property-meta">
//             <span>{property.type === "file" ? "file" : property.type === "fileArray" ? "files" : "unknown"}</span>
//             {property.isOptional ? <span>Optional</span> : <span className="t-danger">Required</span>}
//         </span>
//     );
// }

export function renderTypeShorthand(
  shape: TypeShapeOrReference,
  {
    plural = false,
    withArticle = false,
    nullable = false,
  }: TypeShorthandOptions = {
    plural: false,
    withArticle: false,
    nullable: false,
  },
  types: Record<string, TypeDefinition>
): string {
  const unwrapped = unwrapReference(shape, types);

  const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
    withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;

  if (unwrapped.isOptional) {
    return `${maybeWithArticle("an", nullable ? "optional" : "optional")} ${renderTypeShorthand(unwrapped.shape, { plural }, types)}`;
  }

  return visitDiscriminatedUnion(unwrapped.shape)._visit({
    // primitives
    primitive: (primitive) =>
      visitDiscriminatedUnion(primitive.value, "type")._visit({
        string: () => (plural ? "strings" : maybeWithArticle("a", "string")),
        integer: () =>
          plural ? "integers" : maybeWithArticle("an", "integer"),
        uint: () => (plural ? "uints" : maybeWithArticle("a", "uint")),
        uint64: () => (plural ? "uint64s" : maybeWithArticle("a", "uint64")),
        double: () => (plural ? "doubles" : maybeWithArticle("a", "double")),
        long: () => (plural ? "longs" : maybeWithArticle("a", "long")),
        boolean: () => (plural ? "booleans" : maybeWithArticle("a", "boolean")),
        datetime: () =>
          plural ? "datetimes" : maybeWithArticle("a", "datetime"),
        uuid: () => (plural ? "UUIDs" : maybeWithArticle("a", "UUID")),
        base64: () =>
          plural ? "Base64 strings" : maybeWithArticle("a", "Base64 string"),
        date: () => (plural ? "dates" : maybeWithArticle("a", "date")),
        bigInteger: () =>
          plural ? "big integers" : maybeWithArticle("a", "big integer"),
        _other: () => "<unknown>",
      }),

    // referenced shapes
    object: () => (plural ? "objects" : maybeWithArticle("an", "object")),
    undiscriminatedUnion: (union) => {
      return uniq(
        union.variants.map((variant) =>
          renderTypeShorthand(variant.shape, { plural, withArticle }, types)
        )
      ).join(" or ");
    },
    discriminatedUnion: () =>
      plural ? "objects" : maybeWithArticle("an", "object"),
    enum: (enumValue) => {
      // if there are only 1 or 2 values, we can list them like literals (e.g. "apple" or "banana")
      if (enumValue.values.length > 0 && enumValue.values.length < 3) {
        return enumValue.values.map((value) => `"${value.value}"`).join(" or ");
      }
      return plural ? "enums" : maybeWithArticle("an", "enum");
    },

    // containing shapes
    list: (list) =>
      `${plural ? "lists of" : maybeWithArticle("a", "list of")} ${renderTypeShorthand(
        list.itemShape,
        { plural: true },
        types
      )}`,
    set: (set) =>
      `${plural ? "sets of" : maybeWithArticle("a", "set of")} ${renderTypeShorthand(
        set.itemShape,
        { plural: true },
        types
      )}`,
    map: (map) =>
      `${plural ? "maps from" : maybeWithArticle("a", "map from")} ${renderTypeShorthand(
        map.keyShape,
        { plural: true },
        types
      )} to ${renderTypeShorthand(map.valueShape, { plural: true }, types)}`,

    // literals
    literal: (literal) =>
      visitDiscriminatedUnion(literal.value, "type")._visit({
        stringLiteral: ({ value }) => `"${value}"`,
        booleanLiteral: ({ value }) => value.toString(),
        _other: () => "<unknown>",
      }),
    // other
    unknown: (value) => value.displayName ?? "any",
    _other: () => "<unknown>",
  });
}
