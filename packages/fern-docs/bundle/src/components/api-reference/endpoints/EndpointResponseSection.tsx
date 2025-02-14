import "server-only";

import React from "react";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { MdxServerComponentProseSuspense } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

import { TypeDefinitionResponse } from "../types/context/TypeDefinitionContext";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { ResponseSummaryFallback } from "./response-summary-fallback";

export function EndpointResponseSection({
  loader,
  response,
  anchorIdParts,
  slug,
  types,
}: {
  loader: DocsLoader;
  response: ApiDefinition.HttpResponse;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  return (
    <TypeDefinitionResponse>
      <MdxServerComponentProseSuspense
        loader={loader}
        size="sm"
        className="!t-muted border-default border-b pb-5 leading-6"
        mdx={response.description}
        fallback={<ResponseSummaryFallback response={response} types={types} />}
      />
      <EndpointResponseSectionContent
        loader={loader}
        body={response.body}
        anchorIdParts={anchorIdParts}
        slug={slug}
        types={types}
      />
    </TypeDefinitionResponse>
  );
}

function EndpointResponseSectionContent({
  loader,
  body,
  anchorIdParts,
  slug,
  types,
}: {
  loader: DocsLoader;
  body: ApiDefinition.HttpResponseBodyShape;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}) {
  switch (body.type) {
    case "empty":
    case "fileDownload":
    case "streamingText":
      return null;
    case "stream":
      return (
        <TypeReferenceDefinitions
          loader={loader}
          shape={body.shape}
          isCollapsible={false}
          anchorIdParts={anchorIdParts}
          slug={slug}
          applyErrorStyles={false}
          types={types}
        />
      );
    default:
      return (
        <TypeReferenceDefinitions
          loader={loader}
          shape={body}
          isCollapsible={false}
          anchorIdParts={anchorIdParts}
          slug={slug}
          applyErrorStyles={false}
          types={types}
        />
      );
  }
}
