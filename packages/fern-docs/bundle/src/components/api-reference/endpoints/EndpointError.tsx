import "server-only";

import React from "react";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { Separator } from "@/components/Separator";
import { MdxServerComponentProseSuspense } from "@/mdx/components/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import { renderTypeShorthand } from "../../type-shorthand";
import { TypeReferenceDefinitions } from "../type-definitions/TypeReferenceDefinitions";

export function EndpointError({
  serialize,
  error,
  types,
}: {
  serialize: MdxSerializer;
  error: ApiDefinition.ErrorResponse;
  availability: APIV1Read.Availability | null | undefined;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  if (error.shape == null) {
    return null;
  }
  return (
    <div className="-mb-2 space-y-2 pt-2 text-left">
      <MdxServerComponentProseSuspense
        serialize={serialize}
        mdx={error.description}
        fallback={`This error returns ${renderTypeShorthand(error.shape, { withArticle: true }, types)}.`}
        size="sm"
        className="text-(color:--grayscale-a11)"
      />
      {shouldHideShape(error.shape, types) ? null : (
        <>
          <Separator />
          <TypeReferenceDefinitions
            serialize={serialize}
            shape={error.shape}
            types={types}
          />
        </>
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
