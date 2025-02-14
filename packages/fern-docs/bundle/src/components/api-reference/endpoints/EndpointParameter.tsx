import "server-only";

import React from "react";

import { compact } from "es-toolkit/array";

import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import { cn } from "@fern-docs/components";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import { addLeadingSlash, conformTrailingSlash } from "@fern-docs/utils";

import { MdxServerComponentProse } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

import { FernAnchor } from "../../components/FernAnchor";
import { renderTypeShorthandRoot } from "../../type-shorthand";
import { getAnchorId } from "../../util/anchor";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";

export function EndpointParameter({
  loader,
  name,
  description,
  additionalDescriptions,
  anchorIdParts,
  slug,
  shape,
  availability,
  types,
}: {
  loader: DocsLoader;
  name: string;
  description: string | undefined;
  additionalDescriptions: readonly string[] | undefined;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  availability: ApiDefinition.Availability | null | undefined;
  shape: ApiDefinition.TypeShape;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  return (
    <EndpointParameterContent
      loader={loader}
      name={name}
      description={description}
      additionalDescriptions={additionalDescriptions}
      typeShorthand={renderTypeShorthandRoot(shape, types, false)}
      anchorIdParts={anchorIdParts}
      slug={slug}
      availability={availability}
    >
      <TypeReferenceDefinitions
        loader={loader}
        shape={shape}
        isCollapsible={true}
        anchorIdParts={anchorIdParts}
        slug={slug}
        applyErrorStyles={false}
        types={types}
      />
    </EndpointParameterContent>
  );
}

export function EndpointParameterContent({
  loader,
  name,
  anchorIdParts,
  slug,
  availability,
  description: descriptionProp,
  additionalDescriptions = EMPTY_ARRAY,
  typeShorthand,
  children,
}: {
  name: string;
  description: string | undefined;
  additionalDescriptions: readonly string[] | undefined;
  typeShorthand: React.ReactNode;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  availability: ApiDefinition.Availability | null | undefined;
  loader: DocsLoader;
  children?: React.ReactNode;
}) {
  const href =
    conformTrailingSlash(addLeadingSlash(slug)) +
    "#" +
    getAnchorId(anchorIdParts);

  const description = compact([descriptionProp, ...additionalDescriptions])[0];

  return (
    <div
      id={href}
      className={cn("relative flex scroll-mt-4 flex-col gap-2 py-3", {
        "outline-accent rounded-sm outline outline-1 outline-offset-4": false,
      })}
    >
      <FernAnchor href={href} sideOffset={6}>
        <span className="inline-flex items-baseline gap-2">
          <span className="fern-api-property-key">{name}</span>
          {typeShorthand}
          {availability != null && (
            <AvailabilityBadge availability={availability} size="sm" rounded />
          )}
        </span>
      </FernAnchor>
      <MdxServerComponentProse loader={loader} mdx={description} size="sm" />
      {children}
    </div>
  );
}
