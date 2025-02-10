import React from "react";

import { UnreachableCaseError } from "ts-essentials";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";
import { ListTypeContextProvider } from "./ListTypeContextProvider";
import { MapTypeContextProvider } from "./MapTypeContextProvider";

export declare namespace InternalTypeReferenceDefinitions {
  export interface Props {
    applyErrorStyles: boolean;
    isCollapsible: boolean;
    className?: string;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
    shape: ApiDefinition.TypeShapeOrReference;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
    isResponse?: boolean;
  }
}

// HACHACK: this is a hack to render inlined enums above the description
export function hasInlineEnum(
  shape: ApiDefinition.TypeShapeOrReference,
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>
): boolean {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  return visitDiscriminatedUnion(unwrapped.shape)._visit<boolean>({
    object: () => false,
    enum: (value) => value.values.length < 6,
    undiscriminatedUnion: () => false,
    discriminatedUnion: () => false,
    list: (value) => hasInlineEnum(value.itemShape, types),
    set: (value) => hasInlineEnum(value.itemShape, types),
    map: (map) =>
      hasInlineEnum(map.keyShape, types) ||
      hasInlineEnum(map.valueShape, types),
    primitive: () => false,
    literal: () => true,
    unknown: () => false,
    _other: () => false,
  });
}

export function hasInternalTypeReference(
  shape: ApiDefinition.TypeShapeOrReference,
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>
): boolean {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  return visitDiscriminatedUnion(unwrapped.shape)._visit<boolean>({
    object: () => true,
    enum: () => true,
    undiscriminatedUnion: () => true,
    discriminatedUnion: () => true,
    list: () => true,
    set: () => true,
    map: (map) =>
      hasInternalTypeReference(map.keyShape, types) ||
      hasInternalTypeReference(map.valueShape, types),
    primitive: () => false,
    literal: () => true,
    unknown: () => false,
    _other: () => false,
  });
}

export const InternalTypeReferenceDefinitions: React.FC<
  InternalTypeReferenceDefinitions.Props
> = ({
  shape,
  applyErrorStyles,
  isCollapsible,
  className,
  anchorIdParts,
  slug,
  types,
}) => {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  switch (unwrapped.shape.type) {
    case "object": {
      if (unwrapped.shape.extraProperties != null) {
        // TODO: (rohin) Refactor this
        return (
          <InternalTypeDefinition
            shape={unwrapped.shape}
            isCollapsible={isCollapsible}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        );
      }
      return (
        <InternalTypeDefinition
          shape={unwrapped.shape}
          isCollapsible={isCollapsible}
          anchorIdParts={anchorIdParts}
          slug={slug}
          types={types}
        />
      );
    }
    case "enum":
    case "primitive":
    case "undiscriminatedUnion": {
      return (
        <InternalTypeDefinition
          shape={unwrapped.shape}
          isCollapsible={isCollapsible}
          anchorIdParts={anchorIdParts}
          slug={slug}
          types={types}
        />
      );
    }
    case "discriminatedUnion": {
      const union = unwrapped.shape;
      return (
        <InternalTypeDefinition
          shape={union}
          isCollapsible={isCollapsible}
          anchorIdParts={anchorIdParts}
          slug={slug}
          types={types}
        />
      );
    }
    case "list":
    case "set": {
      return (
        <ListTypeContextProvider>
          <InternalTypeReferenceDefinitions
            shape={unwrapped.shape.itemShape}
            isCollapsible={isCollapsible}
            applyErrorStyles={applyErrorStyles}
            className={className}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        </ListTypeContextProvider>
      );
    }
    case "map": {
      return (
        <MapTypeContextProvider>
          <InternalTypeReferenceDefinitions
            shape={unwrapped.shape.keyShape}
            isCollapsible={isCollapsible}
            applyErrorStyles={applyErrorStyles}
            className={className}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
          <InternalTypeReferenceDefinitions
            shape={unwrapped.shape.valueShape}
            isCollapsible={isCollapsible}
            applyErrorStyles={applyErrorStyles}
            className={className}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        </MapTypeContextProvider>
      );
    }
    case "literal":
    case "unknown":
      return null;
    default:
      throw new UnreachableCaseError(unwrapped.shape);
  }
};
