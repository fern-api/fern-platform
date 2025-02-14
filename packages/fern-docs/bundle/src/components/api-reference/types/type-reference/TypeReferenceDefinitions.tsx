import "server-only";

import React from "react";

import { UnreachableCaseError } from "ts-essentials";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { DocsLoader } from "@/server/docs-loader";

import { TypeDefinitionPathPart } from "../context/TypeDefinitionContext";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";

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

export function TypeReferenceDefinitions({
  loader,
  shape,
  applyErrorStyles,
  isCollapsible,
  className,
  anchorIdParts,
  slug,
  types,
}: {
  loader: DocsLoader;
  applyErrorStyles: boolean;
  isCollapsible: boolean;
  className?: string;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  shape: ApiDefinition.TypeShapeOrReference;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  switch (unwrapped.shape.type) {
    case "object": {
      if (unwrapped.shape.extraProperties != null) {
        // TODO: (rohin) Refactor this
        return (
          <InternalTypeDefinition
            loader={loader}
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
          loader={loader}
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
          loader={loader}
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
          loader={loader}
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
        <TypeDefinitionPathPart part={{ type: "listItem" }}>
          <TypeReferenceDefinitions
            loader={loader}
            shape={unwrapped.shape.itemShape}
            isCollapsible={isCollapsible}
            applyErrorStyles={applyErrorStyles}
            className={className}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        </TypeDefinitionPathPart>
      );
    }
    case "map": {
      return (
        <TypeDefinitionPathPart part={{ type: "objectProperty" }}>
          <TypeReferenceDefinitions
            loader={loader}
            shape={unwrapped.shape.keyShape}
            isCollapsible={isCollapsible}
            applyErrorStyles={applyErrorStyles}
            className={className}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
          <TypeReferenceDefinitions
            loader={loader}
            shape={unwrapped.shape.valueShape}
            isCollapsible={isCollapsible}
            applyErrorStyles={applyErrorStyles}
            className={className}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        </TypeDefinitionPathPart>
      );
    }
    case "literal":
    case "unknown":
      return null;
    default:
      throw new UnreachableCaseError(unwrapped.shape);
  }
}
