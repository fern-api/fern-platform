import "server-only";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { MdxServerComponentProse } from "@/components/mdx/server-component";
import { DocsLoader } from "@/server/docs-loader";

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
    <>
      <MdxServerComponentProse
        loader={loader}
        size="sm"
        className="!t-muted border-default border-b pb-5 leading-6"
        mdx={response.description}
        fallback={<ResponseSummaryFallback response={response} types={types} />}
      />
      <EndpointResponseSectionContent
        body={response.body}
        anchorIdParts={anchorIdParts}
        slug={slug}
        types={types}
      />
    </>
  );
}

interface EndpointResponseSectionContentProps {
  body: ApiDefinition.HttpResponseBodyShape;
  anchorIdParts: readonly string[];
  slug: FernNavigation.Slug;
  types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
}

function EndpointResponseSectionContent({
  body,
  anchorIdParts,
  slug,
  types,
}: EndpointResponseSectionContentProps) {
  switch (body.type) {
    case "empty":
    case "fileDownload":
    case "streamingText":
      return null;
    case "stream":
      return (
        <TypeReferenceDefinitions
          shape={body.shape}
          isCollapsible={false}
          anchorIdParts={anchorIdParts}
          slug={slug}
          applyErrorStyles={false}
          types={types}
          isResponse={true}
        />
      );
    default:
      return (
        <TypeReferenceDefinitions
          shape={body}
          isCollapsible={false}
          anchorIdParts={anchorIdParts}
          slug={slug}
          applyErrorStyles={false}
          types={types}
          isResponse={true}
        />
      );
  }
}
