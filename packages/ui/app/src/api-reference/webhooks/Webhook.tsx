import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useMemo } from "react";
import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { WebhookContent } from "./WebhookContent";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";

export declare namespace Webhook {
    export interface Props {
        node: FernNavigation.WebhookNode;
        apiDefinition: ApiDefinition.ApiDefinition;
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        isLastInApi: boolean;
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ node, apiDefinition, isLastInApi, breadcrumb }) => {
    const context = useMemo(() => ApiDefinition.createWebhookContext(node, apiDefinition), [node, apiDefinition]);

    // TODO: merge this with the Endpoint component
    if (useShouldLazyRender(node.slug)) {
        return null;
    }

    if (!context) {
        // eslint-disable-next-line no-console
        console.error("Could not create context for webhook", node);
        return null;
    }

    return (
        <WebhookContextProvider>
            <WebhookContent breadcrumb={breadcrumb} context={context} hideBottomSeparator={isLastInApi} />
        </WebhookContextProvider>
    );
};
