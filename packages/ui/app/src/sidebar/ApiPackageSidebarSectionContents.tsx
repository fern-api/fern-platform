import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { getEndpointTitleAsString } from "../util/endpoint";
import { ApiSubpackages } from "./ApiSubpackages";
import { SidebarItem } from "./SidebarItem";

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
                    title={getEndpointTitleAsString(endpoint)}
                    paddingLeftAdditional={20 + 8} // Chevron Icon + Spacing: w-5 + space-x-2
                />
            ))}
            {package_.webhooks.map((webhook, webhookIndex) => (
                <SidebarItem
                    key={webhookIndex}
                    slug={joinUrlSlugs(slug, webhook.urlSlug)}
                    title={webhook.name ?? ""}
                    paddingLeftAdditional={20 + 8} // Chevron Icon + Spacing: w-5 + space-x-2
                />
            ))}
            <ApiSubpackages package={package_} slug={slug} />
        </div>
    );
};
