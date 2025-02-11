"use client";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthand } from "../../type-shorthand";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { useEndpointContext } from "./EndpointContext";

export declare namespace EndpointResponseSection {
  export interface Props {
    response: ApiDefinition.HttpResponse;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
  }
}

export const EndpointResponseSection: React.FC<
  EndpointResponseSection.Props
> = ({ response, anchorIdParts, slug, types }) => {
  const isAudioFileDownloadSpanSummary = false;
  const { selectedExample } = useEndpointContext();
  const exampleResponseBody = selectedExample?.exampleCall.responseBody;

  return (
    <div>
      <Markdown
        size="sm"
        className="!t-muted border-default border-b pb-5 leading-6"
        mdx={response.description}
        fallback={getResponseSummary({
          response,
          exampleResponseBody,
          types,
          isAudioFileDownloadSpanSummary,
        })}
      />
      <EndpointResponseSectionContent
        body={response.body}
        anchorIdParts={anchorIdParts}
        slug={slug}
        types={types}
      />
    </div>
  );
};

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

function getResponseSummary({
  response,
  exampleResponseBody,
  types,
  isAudioFileDownloadSpanSummary,
}: {
  response: ApiDefinition.HttpResponse;
  exampleResponseBody: ApiDefinition.ExampleEndpointResponse | undefined;
  types: Record<string, ApiDefinition.TypeDefinition>;
  isAudioFileDownloadSpanSummary: boolean;
}) {
  switch (response.body.type) {
    case "empty":
      return "This endpoint returns nothing.";
    case "fileDownload": {
      if (isAudioFileDownloadSpanSummary) {
        return (
          <span>
            This endpoint returns an <code>audio/mpeg</code> file.
          </span>
        );
      }
      return "This endpoint returns a file.";
    }
    case "streamingText":
      return "This endpoint sends text responses over a long-lived HTTP connection.";
    case "stream":
      return `This endpoint returns a stream of ${exampleResponseBody?.type === "sse" ? "server sent events" : renderTypeShorthand(response.body.shape, { withArticle: false }, types)}.`;
    default:
      return `This endpoint returns ${renderTypeShorthand(response.body, { withArticle: true }, types)}.`;
  }
}
