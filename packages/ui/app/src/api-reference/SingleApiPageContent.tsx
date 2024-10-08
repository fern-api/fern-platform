import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import type { DocsContent } from "../resolver/DocsContent";

const Endpoint = dynamic(() => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint), { ssr: true });
const Webhook = dynamic(() => import("./webhooks/Webhook").then(({ Webhook }) => Webhook), { ssr: true });
const WebSocket = dynamic(() => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket), { ssr: true });

interface SingleApiPageContentProps {
    content: DocsContent.ApiEndpointPage;
}

export function SingleApiPageContent({ content }: SingleApiPageContentProps): ReactElement | null {
    return (
        <FernErrorBoundary component="ApiPackageContents">
            {visitDiscriminatedUnion(content.item)._visit({
                endpoint: (endpoint) => (
                    <Endpoint
                        api={endpoint.apiDefinitionId}
                        showErrors={content.showErrors}
                        node={endpoint}
                        isLastInApi={true}
                        apiDefinition={content.apiDefinition}
                    />
                ),
                webhook: (webhook) => <Webhook webhook={webhook} isLastInApi={true} types={types} />,
                websocket: (websocket) => (
                    <WebSocket api={item.apiDefinitionId} websocket={websocket} isLastInApi={true} types={types} />
                ),
            })}
        </FernErrorBoundary>
    );
}
