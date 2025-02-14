import "server-only";

import { ReactElement } from "react";

import {
  TypeDefinition,
  TypeId,
  TypeShapeOrReference,
  unwrapObjectType,
  unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import { Slug } from "@fern-api/fdr-sdk/navigation";

import { DocsLoader } from "@/server/docs-loader";

import { DiscriminatedUnionVariant } from "../discriminated-union/DiscriminatedUnionVariant";
import { EnumValue } from "../enum/EnumValue";
import { ObjectProperty } from "../object/ObjectProperty";
import { UndiscriminatedUnionVariant } from "../undiscriminated-union/UndiscriminatedUnionVariant";

interface CollapsibleContent {
  elements: ReactElement<any>[];
  elementNameSingular: string;
  elementNamePlural: string;
  separatorText?: string;
}

export function createCollapsibleContent(
  loader: DocsLoader,
  shape: TypeShapeOrReference,
  types: Record<TypeId, TypeDefinition>,
  anchorIdParts: readonly string[],
  slug: Slug
): CollapsibleContent | undefined {
  const unwrapped = unwrapReference(shape, types);

  switch (unwrapped.shape.type) {
    case "discriminatedUnion": {
      const union = unwrapped.shape;
      return {
        elements: union.variants.map((variant) => (
          <DiscriminatedUnionVariant
            loader={loader}
            key={variant.discriminantValue}
            discriminant={union.discriminant}
            unionVariant={variant}
            anchorIdParts={[...anchorIdParts, variant.discriminantValue]}
            slug={slug}
            types={types}
          />
        )),
        elementNameSingular: "variant",
        elementNamePlural: "variants",
        separatorText: "OR",
      };
    }
    case "enum": {
      return {
        elements: unwrapped.shape.values.map((enumValue) => (
          <EnumValue
            key={enumValue.value}
            loader={loader}
            enumValue={enumValue}
          />
        )),
        elementNameSingular: "enum value",
        elementNamePlural: "enum values",
      };
    }
    case "object": {
      const { properties } = unwrapObjectType(unwrapped.shape, types);
      return {
        elements: properties.map((property) => (
          <ObjectProperty
            loader={loader}
            key={property.key}
            property={property}
            anchorIdParts={[...anchorIdParts, property.key]}
            slug={slug}
            types={types}
          />
        )),
        elementNameSingular: "property",
        elementNamePlural: "properties",
      };
    }
    case "undiscriminatedUnion": {
      return {
        elements: unwrapped.shape.variants.map((variant, variantIdx) => (
          <UndiscriminatedUnionVariant
            loader={loader}
            key={variantIdx}
            unionVariant={variant}
            anchorIdParts={[
              ...anchorIdParts,
              variant.displayName ?? variantIdx.toString(),
            ]}
            slug={slug}
            idx={variantIdx}
            types={types}
          />
        )),
        elementNameSingular: "variant",
        elementNamePlural: "variants",
        separatorText: "OR",
      };
    }
    default:
      return undefined;
  }
}
