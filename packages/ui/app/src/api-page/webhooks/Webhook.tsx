import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { ResolvedTypeDefinition, ResolvedWebhookDefinition } from "../../resolver/types";
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
                hideBottomSeparator={isLastInApi}
                route={route}
                types={types}
            />
        </WebhookContextProvider>
    );
};
