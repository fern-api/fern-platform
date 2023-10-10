import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useNavigationContext } from "../../navigation-context";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";
import { WebhookContent } from "./WebhookContent";

export declare namespace Webhook {
    export interface Props {
        webhook: FernRegistryApiRead.WebhookDefinition;
        isLastInApi: boolean;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
        anchorIdParts: string[];
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ webhook, slug, package: package_, isLastInApi, anchorIdParts }) => {
    const { getFullSlug } = useNavigationContext();
    const { setTargetRef } = useApiPageCenterElement({ slug });

    return (
        <WebhookContextProvider>
            <WebhookContent
                webhook={webhook}
                setContainerRef={setTargetRef}
                package={package_}
                hideBottomSeparator={isLastInApi}
                anchorIdParts={anchorIdParts}
                route={`/${getFullSlug(slug)}`}
            />
        </WebhookContextProvider>
    );
};
