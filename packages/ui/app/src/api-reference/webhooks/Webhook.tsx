import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { WebhookContent } from "./WebhookContent";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";

export declare namespace Webhook {
    export interface Props {
        webhook: ApiDefinition.WebhookDefinition;
        isLastInApi: boolean;
        types: Record<string, ApiDefinition.TypeDefinition>;
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ webhook, isLastInApi, types }) => {
    // TODO: merge this with the Endpoint component
    if (useShouldLazyRender(FernNavigation.Slug(webhook.slug))) {
        return null;
    }

    return (
        <WebhookContextProvider>
            <WebhookContent webhook={webhook} hideBottomSeparator={isLastInApi} types={types} />
        </WebhookContextProvider>
    );
};
