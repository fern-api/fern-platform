import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { ResolvedTypeDefinition, ResolvedWebhookDefinition } from "../../resolver/types";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebhookContent } from "./WebhookContent";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";

export declare namespace Webhook {
    export interface Props {
        webhook: ResolvedWebhookDefinition;
        breadcrumbs: readonly string[];
        isLastInApi: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ webhook, breadcrumbs, isLastInApi, types }) => {
    const ref = useApiPageCenterElement({ slug: webhook.slug });
    const route = `/${webhook.slug}`;

    // TODO: merge this with the Endpoint component
    if (useShouldLazyRender(webhook.slug)) {
        return null;
    }

    return (
        <WebhookContextProvider>
            <WebhookContent
                webhook={webhook}
                breadcrumbs={breadcrumbs}
                ref={ref}
                hideBottomSeparator={isLastInApi}
                route={route}
                types={types}
            />
        </WebhookContextProvider>
    );
};
