import { ResolvedApiDefinitionPackage } from "@fern-ui/app-utils";
import { Endpoint } from "./endpoints/Endpoint";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";
import { Webhook } from "./webhooks/Webhook";

export declare namespace ApiPackageContents {
    export interface Props {
        package: ResolvedApiDefinitionPackage;
        isLastInParentPackage: boolean;
        anchorIdParts: string[];
    }
}

export const ApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    package: package_,
    isLastInParentPackage,
    anchorIdParts,
}) => {
    const { endpoints, webhooks, subpackages } = package_;

    const subpackageTitle = package_.type === "subpackage" ? package_.title : undefined;

    return (
        <>
            {endpoints.map((endpoint, idx) => (
                <Endpoint
                    key={endpoint.id}
                    endpoint={endpoint}
                    subpackageTitle={subpackageTitle}
                    isLastInApi={isLastInParentPackage && idx === endpoints.length - 1}
                />
            ))}
            {webhooks.map((webhook, idx) => (
                <Webhook
                    key={webhook.id}
                    webhook={webhook}
                    subpackageTitle={subpackageTitle}
                    isLastInApi={isLastInParentPackage && idx === webhooks.length - 1}
                />
            ))}
            {subpackages.map((subpackage, idx) => (
                <ApiSubpackage
                    key={subpackage.id}
                    subpackage={subpackage}
                    isLastInParentPackage={idx === subpackages.length - 1}
                    anchorIdParts={anchorIdParts}
                />
            ))}
        </>
    );
};
