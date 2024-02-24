import { APIV1Read } from "@fern-api/fdr-sdk";
import { createRef, useEffect, useMemo } from "react";
import { CodeBlockSkeleton } from "../../../commons/CodeBlockSkeleton";
import { FernScrollArea } from "../../../components/FernScrollArea";
import { getJsonLineNumbers, lineNumberOf } from "../../endpoints/EndpointContentCodeSnippets";
import { TitledExample } from "../../examples/TitledExample";
import { useWebhookContext } from "../webhook-context/useWebhookContext";

export declare namespace WebhookExample {
    export interface Props {
        example: APIV1Read.ExampleWebhookPayload;
    }
}

export const WebhookExample: React.FC<WebhookExample.Props> = ({ example }) => {
    const { hoveredPayloadPropertyPath = [] } = useWebhookContext();

    const payloadJsonString = useMemo(() => JSON.stringify(example.payload, null, 2), [example.payload]);

    const requestHighlightLines = useMemo(() => {
        if (hoveredPayloadPropertyPath.length === 0) {
            return [];
        }
        const startLine = lineNumberOf(payloadJsonString, "-d '{");
        if (startLine === -1) {
            return [];
        }
        return getJsonLineNumbers(payloadJsonString, hoveredPayloadPropertyPath, startLine);
    }, [hoveredPayloadPropertyPath, payloadJsonString]);

    const requestViewportRef = createRef<HTMLDivElement>();

    useEffect(() => {
        if (requestViewportRef.current != null && requestHighlightLines[0] != null) {
            const lineNumber = Array.isArray(requestHighlightLines[0])
                ? requestHighlightLines[0][0]
                : requestHighlightLines[0];
            const offsetTop = lineNumber * 20 - 14;
            requestViewportRef.current.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
    }, [requestHighlightLines, requestViewportRef]);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="grid min-h-0 flex-1 grid-rows-[repeat(auto-fit,_minmax(0,_min-content))] flex-col gap-6">
                    {example.payload != null && (
                        <TitledExample
                            title="Payload"
                            type="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            copyToClipboardText={() => payloadJsonString}
                        >
                            <FernScrollArea viewportRef={requestViewportRef}>
                                <CodeBlockSkeleton
                                    content={payloadJsonString}
                                    language="json"
                                    fontSize="sm"
                                    highlightLines={requestHighlightLines}
                                />
                            </FernScrollArea>
                        </TitledExample>
                    )}
                </div>
            </div>
        </div>
    );
};
