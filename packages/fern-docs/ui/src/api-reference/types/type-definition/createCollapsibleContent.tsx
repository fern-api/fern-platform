import {
  TypeDefinition,
  TypeId,
  TypeShapeOrReference,
  unwrapObjectType,
  unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import { Slug } from "@fern-api/fdr-sdk/navigation";
import { ReactElement } from "react";
import { Chip } from "../../../components/Chip";
import { DiscriminatedUnionVariant } from "../discriminated-union/DiscriminatedUnionVariant";
import { ObjectProperty } from "../object/ObjectProperty";
import { UndiscriminatedUnionVariant } from "../undiscriminated-union/UndiscriminatedUnionVariant";

interface CollapsibleContent {
  elements: ReactElement<{ name: string; description?: string }>[];
  elementNameSingular: string;
  elementNamePlural: string;
  separatorText?: string;
}

export function createCollapsibleContent(
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
          <Chip
            key={enumValue.value}
            name={enumValue.value}
            description={enumValue.description}
          />
          // <EnumValue key={enumValue.value} enumValue={enumValue} />
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
            key={property.key}
            property={property}
            anchorIdParts={[...anchorIdParts, property.key]}
            slug={slug}
            applyErrorStyles
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
            key={variantIdx}
            unionVariant={variant}
            anchorIdParts={[
              ...anchorIdParts,
              variant.displayName ?? variantIdx.toString(),
            ]}
            applyErrorStyles={false}
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
