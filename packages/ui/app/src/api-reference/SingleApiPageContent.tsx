import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import type { ResolvedApiEndpoint, ResolvedTypeDefinition } from "../resolver/types";

const Endpoint = dynamic(() => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint), { ssr: true });
const Webhook = dynamic(() => import("./webhooks/Webhook").then(({ Webhook }) => Webhook), { ssr: true });
const WebSocket = dynamic(() => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket), { ssr: true });

interface SingleApiPageContentProps {
    item: ResolvedApiEndpoint;
    types: Record<string, ResolvedTypeDefinition>;
    showErrors: boolean;
}

export function SingleApiPageContent({ item, showErrors, types }: SingleApiPageContentProps): ReactElement | null {
    return (
        <FernErrorBoundary component="ApiPackageContents">
            {visitDiscriminatedUnion(item)._visit({
                endpoint: (endpoint) => (
                    <Endpoint
                        api={item.apiDefinitionId}
                        showErrors={showErrors}
                        endpoint={endpoint}
                        isLastInApi={true}
                        types={types}
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
