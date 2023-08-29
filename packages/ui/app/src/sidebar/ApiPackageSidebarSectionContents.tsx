import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackages } from "./ApiSubpackages";
import { SidebarEndpointItem } from "./SidebarEndpointItem";
import { SidebarWebhookItem } from "./SidebarWebhookItem";

export declare namespace ApiPackageSidebarSectionContents {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
    }
}

export const ApiPackageSidebarSectionContents: React.FC<ApiPackageSidebarSectionContents.Props> = ({
    package: package_,
    slug,
}) => {
    return (
        <div className="flex flex-col">
            {package_.endpoints.map((endpoint, endpointIndex) => (
                <SidebarEndpointItem
                    key={endpointIndex}
                    endpoint={endpoint}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                />
            ))}
            {package_.webhooks.map((webhook, webhookIndex) => (
                <SidebarWebhookItem key={webhookIndex} webhook={webhook} slug={joinUrlSlugs(slug, webhook.urlSlug)} />
            ))}
            <ApiSubpackages package={package_} slug={slug} />
        </div>
    );
};
