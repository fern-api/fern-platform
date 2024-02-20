import { joinUrlSlugs } from "@fern-api/fdr-sdk";
import { useShouldHideFromSsg } from "../../navigation-context/useNavigationContext";
import { ResolvedWebhookDefinition } from "../../util/resolver";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";
import { WebhookContent } from "./WebhookContent";

export declare namespace Webhook {
    export interface Props {
        webhook: ResolvedWebhookDefinition;
        subpackageTitle: string | undefined;
        isLastInApi: boolean;
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ webhook, subpackageTitle, isLastInApi }) => {
    const fullSlug = joinUrlSlugs(...webhook.slug);
    const { setTargetRef } = useApiPageCenterElement({ slug: fullSlug });
    const route = `/${fullSlug}`;

    // TODO: merge this with the Endpoint component
    if (useShouldHideFromSsg(fullSlug)) {
        return null;
    }

    return (
        <WebhookContextProvider>
            <WebhookContent
                webhook={webhook}
                subpackageTitle={subpackageTitle}
                setContainerRef={setTargetRef}
                hideBottomSeparator={isLastInApi}
                route={route}
            />
        </WebhookContextProvider>
    );
};
