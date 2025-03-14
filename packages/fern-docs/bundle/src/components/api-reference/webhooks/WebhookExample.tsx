"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import type { APIV1Read } from "@fern-api/fdr-sdk";

const CodeSnippetExample = dynamic(
  () =>
    import("../examples/CodeSnippetExample").then(
      ({ CodeSnippetExample }) => CodeSnippetExample
    ),
  { ssr: true }
);

export declare namespace WebhookExample {
  export interface Props {
    example: APIV1Read.ExampleWebhookPayload;
    slug: string;
  }
}

export const WebhookExample: React.FC<WebhookExample.Props> = ({
  example,
  slug,
}) => {
  // const { hoveredPayloadPropertyPath = EMPTY_ARRAY } = useWebhookContext();
  const payloadJsonString = useMemo(
    () => JSON.stringify(example.payload, null, 2),
    [example.payload]
  );

  return (
    <div className="not-prose flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 shrink flex-col">
        {example.payload != null && (
          <CodeSnippetExample
            className="max-h-full"
            title="Payload"
            onClick={(e) => {
              e.stopPropagation();
            }}
            code={payloadJsonString}
            language="json"
            json={example.payload}
            slug={slug}
          />
        )}
      </div>
    </div>
  );
};
