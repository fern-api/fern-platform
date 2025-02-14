import "server-only";

import React from "react";

import { UnreachableCaseError } from "ts-essentials";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { DocsLoader } from "@/server/docs-loader";

import {
  TypeDefinitionPathPart,
  TypeDefinitionSlot,
} from "../context/TypeDefinitionContext";
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
  isCollapsible,
  className,
  anchorIdParts,
  slug,
  types,
}: {
  loader: DocsLoader;
  isCollapsible: boolean;
  className?: string;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  shape: ApiDefinition.TypeShapeOrReference;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  switch (shape.type) {
    case "object": {
      if (shape.extraProperties != null) {
        // TODO: (rohin) Refactor this
        return (
          <InternalTypeDefinition
            loader={loader}
            shape={shape}
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
          shape={shape}
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
          shape={shape}
          isCollapsible={isCollapsible}
          anchorIdParts={anchorIdParts}
          slug={slug}
          types={types}
        />
      );
    }
    case "discriminatedUnion": {
      return (
        <InternalTypeDefinition
          loader={loader}
          shape={shape}
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
            shape={shape.itemShape}
            isCollapsible={isCollapsible}
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
            shape={shape.keyShape}
            isCollapsible={isCollapsible}
            className={className}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
          <TypeReferenceDefinitions
            loader={loader}
            shape={shape.valueShape}
            isCollapsible={isCollapsible}
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
    case "alias": {
      return (
        <TypeReferenceDefinitions
          loader={loader}
          shape={shape.value}
          isCollapsible={isCollapsible}
          className={className}
          anchorIdParts={anchorIdParts}
          slug={slug}
          types={types}
        />
      );
    }
    case "id":
      return <TypeDefinitionSlot id={shape.id} isCollapsible={isCollapsible} />;
    case "optional":
    case "nullable": {
      return (
        <TypeReferenceDefinitions
          loader={loader}
          shape={shape.shape}
          isCollapsible={isCollapsible}
          className={className}
          anchorIdParts={anchorIdParts}
          slug={slug}
          types={types}
        />
      );
    }
    default:
      throw new UnreachableCaseError(shape);
  }
}
