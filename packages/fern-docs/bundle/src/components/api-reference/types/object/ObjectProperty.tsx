import "server-only";

import React from "react";

import { compact } from "es-toolkit/array";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import { addLeadingSlash } from "@fern-docs/utils";

import { MdxServerComponentProseSuspense } from "@/components/mdx/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import { getAnchorId } from "../../../util/anchor";
import { TypeDefinitionPathPart } from "../context/TypeDefinitionContext";
import {
  TypeReferenceDefinitions,
  hasInlineEnum,
  hasInternalTypeReference,
} from "../type-reference/TypeReferenceDefinitions";
import { PropertyKey } from "./PropertyKey";
import { PropertyWrapper } from "./PropertyWrapper";
import { TypeShorthand } from "./TypeShorthand";

export function ObjectProperty({
  serialize,
  property,
  slug,
  types,
  anchorIdParts,
}: {
  serialize: MdxSerializer;
  property: ApiDefinition.ObjectProperty;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  const anchorId = getAnchorId(anchorIdParts);
  const href = `${addLeadingSlash(slug)}#${anchorId}`;

  const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
  const descriptions = compact([
    property.description,
    ...unwrapped.descriptions,
  ]);

  return (
    <PropertyWrapper id={href} className="fern-api-property">
      <TypeDefinitionPathPart
        part={{ type: "objectProperty", propertyName: property.key }}
      >
        <div className="fern-api-property-header">
          <PropertyKey
            className="fern-api-property-key"
            slug={slug}
            anchorId={anchorId}
          >
            {property.key}
          </PropertyKey>
          <TypeShorthand shape={property.valueShape} />
          {property.availability != null && (
            <AvailabilityBadge
              availability={property.availability}
              size="sm"
              rounded
            />
          )}
        </div>
        {hasInlineEnum(property.valueShape, types) && (
          <TypeReferenceDefinitions
            serialize={serialize}
            shape={property.valueShape}
            isCollapsible
            anchorIdParts={anchorIdParts}
            slug={slug}
            types={types}
          />
        )}

        <MdxServerComponentProseSuspense
          serialize={serialize}
          mdx={descriptions[0]}
          size="sm"
        />

        {hasInternalTypeReference(property.valueShape, types) &&
          !hasInlineEnum(property.valueShape, types) && (
            <TypeReferenceDefinitions
              serialize={serialize}
              shape={property.valueShape}
              isCollapsible
              anchorIdParts={anchorIdParts}
              slug={slug}
              types={types}
            />
          )}
      </TypeDefinitionPathPart>
    </PropertyWrapper>
  );
}
