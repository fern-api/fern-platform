import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useShouldLazyRender } from "../../hooks/useShouldLazyRender";
import { WebhookContent } from "./WebhookContent";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";

export declare namespace Webhook {
    export interface Props {
        node: FernNavigation.WebhookNode;
        webhook: ApiDefinition.WebhookDefinition;
        isLastInApi: boolean;
        types: Record<string, ApiDefinition.TypeDefinition>;
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ node, webhook, isLastInApi, types }) => {
    // TODO: merge this with the Endpoint component
    if (useShouldLazyRender(node.slug)) {
        return null;
    }

    return (
        <WebhookContextProvider>
            <WebhookContent
                node={node}
                breadcrumb={[]} // TODO: fill in breadcrumb
                webhook={webhook}
                hideBottomSeparator={isLastInApi}
                types={types}
            />
        </WebhookContextProvider>
    );
};
