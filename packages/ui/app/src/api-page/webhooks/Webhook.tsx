import { useFeatureFlags } from "../../contexts/FeatureFlagContext";
import { useShouldHideFromSsg } from "../../contexts/navigation-context/useNavigationContext";
import { ResolvedTypeDefinition, ResolvedWebhookDefinition } from "../../resolver/resolver";
import { joinUrlSlugs } from "../../util/slug";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";
import { WebhookContent } from "./WebhookContent";

export declare namespace Webhook {
    export interface Props {
        webhook: ResolvedWebhookDefinition;
        breadcrumbs: string[];
        isLastInApi: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ webhook, breadcrumbs, isLastInApi, types }) => {
    const fullSlug = joinUrlSlugs(...webhook.slug);
    const { setTargetRef } = useApiPageCenterElement({ slug: fullSlug });
    const { isApiScrollingDisabled } = useFeatureFlags();
    const route = `/${fullSlug}`;

    // TODO: merge this with the Endpoint component
    if (useShouldHideFromSsg(fullSlug)) {
        return null;
    }

    return (
        <WebhookContextProvider>
            <WebhookContent
                webhook={webhook}
                breadcrumbs={breadcrumbs}
                setContainerRef={setTargetRef}
                hideBottomSeparator={isLastInApi || isApiScrollingDisabled}
                route={route}
                types={types}
            />
        </WebhookContextProvider>
    );
};
