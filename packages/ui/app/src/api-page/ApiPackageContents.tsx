import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { doesSubpackageHaveEndpointsOrWebhooksRecursive } from "@fern-ui/app-utils";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { Endpoint } from "./endpoints/Endpoint";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";
import { Webhook } from "./webhooks/Webhook";

export declare namespace ApiPackageContents {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
        isLastInParentPackage: boolean;
        anchorIdParts: string[];
    }
}

export const ApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    package: package_,
    slug,
    isLastInParentPackage,
    anchorIdParts,
}) => {
    const { resolveSubpackageById } = useApiDefinitionContext();

    return (
        <>
            {package_.endpoints.map((endpoint, idx) => (
                <Endpoint
                    key={endpoint.id}
                    endpoint={endpoint}
                    isLastInApi={isLastInParentPackage && idx === package_.endpoints.length - 1}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                    package={package_}
                    anchorIdParts={anchorIdParts}
                />
            ))}
            {package_.webhooks.map((webhook, idx) => (
                <Webhook
                    key={webhook.id}
                    webhook={webhook}
                    isLastInApi={isLastInParentPackage && idx === package_.webhooks.length - 1}
                    slug={joinUrlSlugs(slug, webhook.urlSlug)}
                    package={package_}
                    anchorIdParts={anchorIdParts}
                />
            ))}
            {package_.subpackages.map((subpackageId, idx) => {
                if (!doesSubpackageHaveEndpointsOrWebhooksRecursive(subpackageId, resolveSubpackageById)) {
                    return null;
                }
                const subpackage = resolveSubpackageById(subpackageId);
                return (
                    <ApiSubpackage
                        key={subpackageId}
                        subpackageId={subpackageId}
                        isLastInParentPackage={idx === package_.subpackages.length - 1}
                        slug={joinUrlSlugs(slug, subpackage.urlSlug)}
                        anchorIdParts={anchorIdParts}
                    />
                );
            })}
        </>
    );
};
