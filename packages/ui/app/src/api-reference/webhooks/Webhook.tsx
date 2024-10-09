import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useMemo } from "react";
import { WebhookContent } from "./WebhookContent";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";

export declare namespace Webhook {
    export interface Props {
        node: FernNavigation.WebhookNode;
        apiDefinition: ApiDefinition.ApiDefinition;
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        last?: boolean;
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ node, apiDefinition, breadcrumb, last }) => {
    const context = useMemo(() => ApiDefinition.createWebhookContext(node, apiDefinition), [node, apiDefinition]);

    if (!context) {
        // eslint-disable-next-line no-console
        console.error("Could not create context for webhook", node);
        return null;
    }

    return (
        <WebhookContextProvider>
            <WebhookContent breadcrumb={breadcrumb} context={context} last={last} />
        </WebhookContextProvider>
    );
};
