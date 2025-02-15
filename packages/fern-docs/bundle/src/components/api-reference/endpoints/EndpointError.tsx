import "server-only";

import React from "react";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { MdxServerComponentProseSuspense } from "@/components/mdx/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import { renderTypeShorthand } from "../../type-shorthand";
import { TypeDefinitionResponse } from "../types/context/TypeDefinitionContext";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";

export function EndpointError({
  serialize,
  error,
  anchorIdParts,
  slug,
  types,
}: {
  serialize: MdxSerializer;
  error: ApiDefinition.ErrorResponse;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  availability: APIV1Read.Availability | null | undefined;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  if (error.shape == null) {
    return null;
  }
  return (
    <div className="space-y-2 pt-2">
      <div className="t-muted w-full text-start text-sm leading-7">
        <MdxServerComponentProseSuspense
          serialize={serialize}
          mdx={error.description}
          fallback={`This error returns ${renderTypeShorthand(error.shape, { withArticle: true }, types)}.`}
        />
      </div>
      {shouldHideShape(error.shape, types) ? null : (
        <div className="w-full text-start">
          <TypeDefinitionResponse>
            <TypeReferenceDefinitions
              serialize={serialize}
              isCollapsible
              shape={error.shape}
              anchorIdParts={anchorIdParts}
              slug={slug}
              types={types}
            />
          </TypeDefinitionResponse>
        </div>
      )}
    </div>
  );
}

function shouldHideShape(
  shape: ApiDefinition.TypeShapeOrReference,
  types: Record<string, ApiDefinition.TypeDefinition>
): boolean {
  return visitDiscriminatedUnion(
    ApiDefinition.unwrapReference(shape, types).shape
  )._visit<boolean>({
    primitive: () => true,
    literal: () => true,
    object: (object) =>
      ApiDefinition.unwrapObjectType(object, types).properties.length === 0,
    undiscriminatedUnion: () => false,
    discriminatedUnion: () => false,
    enum: () => false,
    list: (value) => shouldHideShape(value.itemShape, types),
    set: (value) => shouldHideShape(value.itemShape, types),
    map: () => false,
    unknown: () => true,
    _other: () => true,
  });
}
