import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";
import { WebhookContent } from "./WebhookContent";

export declare namespace Webhook {
    export interface Props {
        webhook: FernRegistryApiRead.WebhookDefinition;
        isLastInApi: boolean;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        fullSlug: string;
        anchorIdParts: string[];
    }
}

export const Webhook: React.FC<Webhook.Props> = ({
    webhook,
    fullSlug,
    package: package_,
    isLastInApi,
    anchorIdParts,
}) => {
    const { setTargetRef } = useApiPageCenterElement({ slug: fullSlug });
    const route = `/${fullSlug}`;

    return (
        <WebhookContextProvider>
            <WebhookContent
                webhook={webhook}
                setContainerRef={setTargetRef}
                package={package_}
                hideBottomSeparator={isLastInApi}
                anchorIdParts={anchorIdParts}
                route={route}
            />
        </WebhookContextProvider>
    );
};
