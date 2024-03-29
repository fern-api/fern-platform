import { ReactElement, useMemo } from "react";
import { HttpMethodTag, WebSocketTag } from "../../commons/HttpMethodTag";
import { FernLink } from "../../components/FernLink";
import { FernScrollArea } from "../../components/FernScrollArea";
import { FernTooltip, FernTooltipProvider } from "../../components/FernTooltip";
import { divideEndpointPathToParts } from "../../util/endpoint";
import {
    ResolvedEndpointDefinition,
    ResolvedPackageItem,
    ResolvedWebSocketChannel,
    ResolvedWebhookDefinition,
} from "../../util/resolver";
import { renderEndpointUrlPathParts } from "../endpoints/EndpointUrl";
import { TitledExample } from "../examples/TitledExample";

function EndpointLink({ endpoint }: { endpoint: ResolvedEndpointDefinition }) {
    return (
        <FernLink href={`/${endpoint.slug.join("/")}`} className="flex items-baseline gap-2" shallow={true}>
            <span className="w-14 text-right">
                <HttpMethodTag method={endpoint.method} />
            </span>
            <span className="font-mono text-sm">
                {useMemo(() => renderEndpointUrlPathParts(divideEndpointPathToParts(endpoint.path)), [endpoint.path])}
            </span>
        </FernLink>
    );
}

function WebhookLink({ webhook }: { webhook: ResolvedWebhookDefinition }) {
    return (
        <FernLink href={`/${webhook.slug.join("/")}`} className="flex items-baseline gap-2" shallow={true}>
            <span className="w-14 text-right">
                <HttpMethodTag method={webhook.method} />
            </span>
            <span className="font-mono text-sm">
                {useMemo(
                    () => renderEndpointUrlPathParts(webhook.path.map((part) => ({ type: "literal", value: part }))),
                    [webhook.path],
                )}
            </span>
        </FernLink>
    );
}

function WebSocketLink({ websocket }: { websocket: ResolvedWebSocketChannel }) {
    return (
        <FernLink href={`/${websocket.slug.join("/")}`} className="flex items-baseline gap-2" shallow={true}>
            <span className="w-14 text-right">
                <WebSocketTag />
            </span>
            <span className="font-mono text-sm">
                {useMemo(() => renderEndpointUrlPathParts(divideEndpointPathToParts(websocket.path)), [websocket.path])}
            </span>
        </FernLink>
    );
}

export function SummaryEndpointsCard({ items }: { items: ResolvedPackageItem[] }): ReactElement | null {
    if (!items.some((item) => item.type !== "subpackage")) {
        return null;
    }
    return (
        <TitledExample title={"Endpoints"} type="primary" disableClipboard={true}>
            <FernScrollArea>
                <div className="space-y-1 p-3">
                    <FernTooltipProvider>
                        {items.map((item) =>
                            ResolvedPackageItem.visit(item, {
                                endpoint: (endpoint) => (
                                    <FernTooltip content={endpoint.name} key={endpoint.id} side="left">
                                        <EndpointLink endpoint={endpoint} />
                                    </FernTooltip>
                                ),
                                webhook: (webhook) => (
                                    <FernTooltip content={webhook.name} key={webhook.id} side="left">
                                        <WebhookLink webhook={webhook} />
                                    </FernTooltip>
                                ),
                                websocket: (websocket) => (
                                    <FernTooltip content={websocket.name} key={websocket.id} side="left">
                                        <WebSocketLink websocket={websocket} />
                                    </FernTooltip>
                                ),
                                subpackage: () => null,
                            }),
                        )}
                    </FernTooltipProvider>
                </div>
            </FernScrollArea>
        </TitledExample>
    );
}
