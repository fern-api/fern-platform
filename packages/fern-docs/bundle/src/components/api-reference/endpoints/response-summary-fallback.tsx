"use client";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";

import { renderTypeShorthand } from "@/components/type-shorthand";

import { useEndpointContext } from "./EndpointContext";

export function ResponseSummaryFallback({
  response,
  types,
}: {
  response: ApiDefinition.HttpResponse;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  const { selectedExample } = useEndpointContext();
  const exampleResponseBody = selectedExample?.exampleCall.responseBody;

  return getResponseSummary({
    response,
    exampleResponseBody,
    types,
    isAudioFileDownloadSpanSummary: false,
  });
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
