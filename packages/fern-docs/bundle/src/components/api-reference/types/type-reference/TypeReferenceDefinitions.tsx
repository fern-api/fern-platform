import "server-only";

import React from "react";

import { UnreachableCaseError } from "ts-essentials";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { MdxSerializer } from "@/server/mdx-serializer";

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
  serialize,
  shape,
  isCollapsible,
  className,
  anchorIdParts,
  slug,
  types,
}: {
  serialize: MdxSerializer;
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
            serialize={serialize}
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
          serialize={serialize}
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
          serialize={serialize}
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
          serialize={serialize}
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
            serialize={serialize}
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
            serialize={serialize}
            shape={shape.keyShape}
            isCollapsible={isCollapsible}
            className={className}
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
          <TypeReferenceDefinitions
            serialize={serialize}
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
          serialize={serialize}
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
          serialize={serialize}
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
