import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { WebhookContextProvider } from "./webhook-context/WebhookContextProvider";
import { WebhookContent } from "./WebhookContent";

export declare namespace Webhook {
    export interface Props {
        webhook: FernRegistryApiRead.WebhookDefinition;
        isLastInApi: boolean;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
    }
}

export const Webhook: React.FC<Webhook.Props> = ({ webhook, slug, package: package_, isLastInApi }) => {
    const { setTargetRef } = useApiPageCenterElement({ slug });

    return (
        <WebhookContextProvider>
            <WebhookContent
                webhook={webhook}
                setContainerRef={setTargetRef}
                package={package_}
                hideBottomSeparator={isLastInApi}
            />
        </WebhookContextProvider>
    );
};
