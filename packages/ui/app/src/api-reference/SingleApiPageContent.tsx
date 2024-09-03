import { visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ReactElement, useMemo } from "react";
import { useNavigationNodes } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { ResolvedApiDefinitionItem, ResolvedTypeDefinition } from "../resolver/types";
import { Endpoint } from "./endpoints/Endpoint";
import { WebSocket } from "./web-socket/WebSocket";
import { Webhook } from "./webhooks/Webhook";

interface SingleApiPageContentProps {
    item: ResolvedApiDefinitionItem;
    types: Record<string, ResolvedTypeDefinition>;
    showErrors: boolean;
}

export function SingleApiPageContent({ item, showErrors, types }: SingleApiPageContentProps): ReactElement | null {
    const navigationNodes = useNavigationNodes();
    const breadcrumbs = useMemo(() => {
        const parents = navigationNodes.getParents(item.nodeId);
        return FernNavigation.utils.createBreadcrumb(parents);
    }, [item.nodeId, navigationNodes]);

    return (
        <FernErrorBoundary component="ApiPackageContents">
            {visitDiscriminatedUnion(item)._visit({
                endpoint: (endpoint) => (
                    <Endpoint
                        api={item.apiDefinitionId}
                        showErrors={showErrors}
                        endpoint={endpoint}
                        breadcrumbs={breadcrumbs}
                        isLastInApi={true}
                        types={types}
                    />
                ),
                webhook: (webhook) => (
                    <Webhook webhook={webhook} breadcrumbs={breadcrumbs} isLastInApi={true} types={types} />
                ),
                websocket: (websocket) => (
                    <WebSocket api={item.apiDefinitionId} websocket={websocket} isLastInApi={true} types={types} />
                ),
            })}
        </FernErrorBoundary>
    );
}
