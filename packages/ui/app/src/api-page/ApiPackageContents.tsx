import { ResolvedApiDefinitionPackage, ResolvedNavigationItemApiSection } from "@fern-ui/app-utils";
import { Endpoint } from "./endpoints/Endpoint";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";
import { Webhook } from "./webhooks/Webhook";

export declare namespace ApiPackageContents {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        apiDefinition: ResolvedApiDefinitionPackage;
        isLastInParentPackage: boolean;
        anchorIdParts: string[];
        maxContentWidth: string;
    }
}

export const ApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    apiSection,
    apiDefinition,
    isLastInParentPackage,
    anchorIdParts,
    maxContentWidth,
}) => {
    const { endpoints, webhooks, subpackages } = apiDefinition;

    const subpackageTitle = apiDefinition.type === "subpackage" ? apiDefinition.title : undefined;

    return (
        <>
            {endpoints.map((endpoint, idx) => (
                <Endpoint
                    key={endpoint.id}
                    apiSection={apiSection}
                    apiDefinition={apiDefinition}
                    endpoint={endpoint}
                    subpackageTitle={subpackageTitle}
                    isLastInApi={isLastInParentPackage && idx === endpoints.length - 1}
                    maxContentWidth={maxContentWidth}
                />
            ))}
            {webhooks.map((webhook, idx) => (
                <Webhook
                    key={webhook.id}
                    webhook={webhook}
                    subpackageTitle={subpackageTitle}
                    isLastInApi={isLastInParentPackage && idx === webhooks.length - 1}
                    maxContentWidth={maxContentWidth}
                />
            ))}
            {subpackages.map((subpackage, idx) => (
                <ApiSubpackage
                    key={subpackage.id}
                    apiSection={apiSection}
                    apiDefinition={subpackage}
                    isLastInParentPackage={idx === subpackages.length - 1}
                    anchorIdParts={anchorIdParts}
                    maxContentWidth={maxContentWidth}
                />
            ))}
        </>
    );
};
