import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { EndpointTitle } from "../api-page/endpoints/EndpointTitle";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackages } from "./ApiSubpackages";
import { SidebarItem } from "./SidebarItem";
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
                <SidebarItem
                    key={endpointIndex}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                    title={<EndpointTitle endpoint={endpoint} />}
                />
            ))}
            {package_.webhooks.map((webhook, webhookIndex) => (
                <SidebarWebhookItem key={webhookIndex} webhook={webhook} slug={joinUrlSlugs(slug, webhook.urlSlug)} />
            ))}
            <ApiSubpackages package={package_} slug={slug} />
        </div>
    );
};
