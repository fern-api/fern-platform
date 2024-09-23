import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import dynamic from "next/dynamic";
import { ReactElement } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";

const Endpoint = dynamic(() => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint), { ssr: true });
const Webhook = dynamic(() => import("./webhooks/Webhook").then(({ Webhook }) => Webhook), { ssr: true });
const WebSocket = dynamic(() => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket), { ssr: true });

export declare namespace ApiPage {
    interface EndpointDefintion extends ApiDefinition.EndpointDefinition {
        type: "endpoint";
    }

    interface EndpointPair {
        type: "endpointPair";
        stream: ApiDefinition.EndpointDefinition;
        nonStream: ApiDefinition.EndpointDefinition;
    }

    interface WebSocketChannel extends ApiDefinition.WebSocketChannel {
        type: "websocket";
    }

    interface WebhookDefinition extends ApiDefinition.WebhookDefinition {
        type: "webhook";
    }

    type Item = EndpointDefintion | EndpointPair | WebSocketChannel | WebhookDefinition;
}

interface SingleApiPageContentProps {
    item: ApiPage.Item;
    types: Record<string, ApiDefinition.TypeDefinition>;
    showErrors: boolean;
}

export function SingleApiPageContent({ item, showErrors, types }: SingleApiPageContentProps): ReactElement | null {
    return (
        <FernErrorBoundary component="ApiPackageContents">
            {visitDiscriminatedUnion(item)._visit({
                endpoint: (endpoint) => (
                    <Endpoint
                        api={endpoint.apiDefinitionId}
                        showErrors={showErrors}
                        endpoint={endpoint}
                        isLastInApi={true}
                        types={types}
                    />
                ),
                endpointPair: (endpointPair) => (
                    <>
                        <Endpoint
                            api={endpointPair.stream.apiDefinitionId}
                            showErrors={showErrors}
                            endpoint={endpointPair.stream}
                            isLastInApi={false}
                            types={types}
                        />
                        {/* <Endpoint
                            api={item.apiDefinitionId}
                            showErrors={showErrors}
                            endpoint={endpointPair.nonStream}
                            isLastInApi={true}
                            types={types}
                        /> */}
                    </>
                ),
                webhook: (webhook) => <Webhook webhook={webhook} isLastInApi={true} types={types} />,
                websocket: (websocket) => (
                    <WebSocket api={websocket.apiDefinitionId} websocket={websocket} isLastInApi={true} types={types} />
                ),
            })}
        </FernErrorBoundary>
    );
}
