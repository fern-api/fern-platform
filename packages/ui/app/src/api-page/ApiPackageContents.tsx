import { ResolvedApiDefinitionPackage, ResolvedNavigationItemApiSection } from "../util/resolver";
import { Endpoint } from "./endpoints/Endpoint";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";
import { WebSocket } from "./web-socket/WebSocket";
import { Webhook } from "./webhooks/Webhook";

export declare namespace ApiPackageContents {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        apiDefinition: ResolvedApiDefinitionPackage;
        isLastInParentPackage: boolean;
        anchorIdParts: string[];
        breadcrumbs?: string[];
    }
}

export const ApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    apiSection,
    apiDefinition,
    isLastInParentPackage,
    anchorIdParts,
    breadcrumbs = [],
}) => {
    const { endpoints, webhooks, websockets, subpackages } = apiDefinition;

    const subpackageTitle = apiDefinition.type === "subpackage" ? apiDefinition.title : undefined;
    const currentBreadcrumbs = subpackageTitle != null ? [...breadcrumbs, subpackageTitle] : breadcrumbs;

    return (
        <>
            {endpoints.map((endpoint, idx) => (
                <Endpoint
                    key={endpoint.id}
                    apiSection={apiSection}
                    apiDefinition={apiDefinition}
                    endpoint={endpoint}
                    breadcrumbs={currentBreadcrumbs}
                    isLastInApi={
                        isLastInParentPackage &&
                        webhooks.length === 0 &&
                        subpackages.length === 0 &&
                        idx === endpoints.length - 1
                    }
                    types={apiSection.types}
                />
            ))}
            {websockets.map((websocket, idx) => (
                <WebSocket
                    key={websocket.id}
                    websocket={websocket}
                    isLastInApi={isLastInParentPackage && subpackages.length === 0 && idx === websockets.length - 1}
                    types={apiSection.types}
                />
            ))}
            {webhooks.map((webhook, idx) => (
                <Webhook
                    key={webhook.id}
                    webhook={webhook}
                    breadcrumbs={breadcrumbs}
                    isLastInApi={isLastInParentPackage && subpackages.length === 0 && idx === webhooks.length - 1}
                    types={apiSection.types}
                />
            ))}
            {subpackages.map((subpackage, idx) => (
                <ApiSubpackage
                    key={subpackage.id}
                    apiSection={apiSection}
                    apiDefinition={subpackage}
                    isLastInParentPackage={isLastInParentPackage && idx === subpackages.length - 1}
                    anchorIdParts={anchorIdParts}
                    breadcrumbs={currentBreadcrumbs}
                />
            ))}
        </>
    );
};
