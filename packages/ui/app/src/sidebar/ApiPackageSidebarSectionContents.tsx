import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { getEndpointTitleAsString, isSubpackage } from "@fern-ui/app-utils";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackages } from "./ApiSubpackages";
import { SidebarItem } from "./SidebarItem";

export declare namespace ApiPackageSidebarSectionContents {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
        shallow: boolean;
    }
}

export const ApiPackageSidebarSectionContents: React.FC<ApiPackageSidebarSectionContents.Props> = ({
    package: package_,
    slug,
    shallow,
}) => {
    return (
        <div className="flex flex-col">
            {package_.endpoints.map((endpoint, endpointIndex) => (
                <SidebarItem
                    key={endpointIndex}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                    title={getEndpointTitleAsString(endpoint)}
                    indent={isSubpackage(package_)}
                    shallow={shallow}
                />
            ))}
            {package_.webhooks.map((webhook, webhookIndex) => (
                <SidebarItem
                    key={webhookIndex}
                    slug={joinUrlSlugs(slug, webhook.urlSlug)}
                    title={webhook.name ?? ""}
                    indent={isSubpackage(package_)}
                    shallow={shallow}
                />
            ))}
            <ApiSubpackages package={package_} slug={slug} shallow={shallow} />
        </div>
    );
};
