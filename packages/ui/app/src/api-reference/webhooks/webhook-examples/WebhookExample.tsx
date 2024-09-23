import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_ARRAY } from "@fern-ui/core-utils";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { useWebhookContext } from "../webhook-context/useWebhookContext";

const CodeSnippetExample = dynamic(
    () => import("../../examples/CodeSnippetExample").then(({ CodeSnippetExample }) => CodeSnippetExample),
    { ssr: true },
);

export declare namespace WebhookExample {
    export interface Props {
        example: ApiDefinition.WebhookDefinition["examples"][number];
    }
}

export const WebhookExample: React.FC<WebhookExample.Props> = ({ example }) => {
    const { hoveredPayloadPropertyPath = EMPTY_ARRAY } = useWebhookContext();
    const payloadJsonString = useMemo(() => JSON.stringify(example.payload, null, 2), [example.payload]);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
                        hoveredPropertyPath={hoveredPayloadPropertyPath}
                        json={example.payload}
                    />
                )}
            </div>
        </div>
    );
};
