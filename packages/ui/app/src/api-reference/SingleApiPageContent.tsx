import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import type { DocsContent } from "../resolver/DocsContent";

const Endpoint = dynamic(() => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint), { ssr: true });
const Webhook = dynamic(() => import("./webhooks/Webhook").then(({ Webhook }) => Webhook), { ssr: true });
const WebSocket = dynamic(() => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket), { ssr: true });
const EndpointPair = dynamic(() => import("./endpoints/EndpointPair").then(({ EndpointPair }) => EndpointPair), {
    ssr: true,
});

interface SingleApiPageContentProps {
    content: DocsContent.ApiEndpointPage;
}

export function SingleApiPageContent({ content }: SingleApiPageContentProps): ReactElement | null {
    return (
        <FernErrorBoundary component="ApiPackageContents">
            {visitDiscriminatedUnion(content.item)._visit({
                endpoint: (endpoint) => (
                    <Endpoint
                        showErrors={content.showErrors}
                        node={endpoint}
                        apiDefinition={content.apiDefinition}
                        breadcrumb={content.breadcrumb}
                    />
                ),
                webhook: (webhook) => (
                    <Webhook node={webhook} apiDefinition={content.apiDefinition} breadcrumb={content.breadcrumb} />
                ),
                webSocket: (websocket) => (
                    <WebSocket node={websocket} apiDefinition={content.apiDefinition} breadcrumb={content.breadcrumb} />
                ),
                endpointPair: (pair) => (
                    <EndpointPair
                        apiDefinition={content.apiDefinition}
                        showErrors={content.showErrors}
                        node={pair}
                        breadcrumb={content.breadcrumb}
                    />
                ),
            })}
        </FernErrorBoundary>
    );
}
