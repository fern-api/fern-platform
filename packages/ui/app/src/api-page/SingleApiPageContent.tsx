import { FernNavigation } from "@fern-api/fdr-sdk";
import { useAtomValue } from "jotai";
import { ReactElement, useMemo } from "react";
import { SLUG_ATOM, useNavigationNodes } from "../atoms";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { ResolvedApiDefinition, ResolvedRootPackage, flattenRootPackage } from "../resolver/types";
import { Endpoint } from "./endpoints/Endpoint";
import { WebSocket } from "./web-socket/WebSocket";
import { Webhook } from "./webhooks/Webhook";

interface SingleApiPageContentProps {
    root: ResolvedRootPackage;
    showErrors: boolean;
}

export function SingleApiPageContent({ root, showErrors }: SingleApiPageContentProps): ReactElement | null {
    const flattened = useMemo(() => {
        return flattenRootPackage(root);
    }, [root]);
    const selectedSlug = useAtomValue(SLUG_ATOM);
    const navigationNodes = useNavigationNodes();

    const apiDefinition = flattened.apiDefinitions.find((api) => api.slug === selectedSlug);

    if (apiDefinition == null) {
        return null;
    }

    const parents = navigationNodes.getParents(apiDefinition.nodeId);
    const breadcrumbs = FernNavigation.utils.createBreadcrumb(parents);

    return (
        <FernErrorBoundary component="ApiPackageContents">
            {ResolvedApiDefinition.visit(apiDefinition, {
                endpoint: (endpoint) => (
                    <Endpoint
                        api={root.api}
                        showErrors={showErrors}
                        endpoint={endpoint}
                        breadcrumbs={breadcrumbs}
                        isLastInApi={true}
                        types={root.types}
                    />
                ),
                webhook: (webhook) => (
                    <Webhook webhook={webhook} breadcrumbs={breadcrumbs} isLastInApi={true} types={root.types} />
                ),
                websocket: (websocket) => (
                    <WebSocket api={root.api} websocket={websocket} isLastInApi={true} types={root.types} />
                ),
            })}
        </FernErrorBoundary>
    );
}
