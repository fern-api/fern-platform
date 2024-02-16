import { ResolvedApiDefinitionPackage, ResolvedNavigationItemApiSection } from "@fern-ui/app-utils";
import { Endpoint } from "./endpoints/Endpoint";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";
import { WEBSOCKET_MOCK } from "./web-socket/GenericMockWebSocket";
import { WebSocket } from "./web-socket/WebSocket";
import { Webhook } from "./webhooks/Webhook";

export declare namespace ApiPackageContents {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        apiDefinition: ResolvedApiDefinitionPackage;
        isLastInParentPackage: boolean;
        anchorIdParts: string[];
    }
}

export const ApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    apiSection,
    apiDefinition,
    isLastInParentPackage,
    anchorIdParts,
}) => {
    const { endpoints, webhooks, subpackages } = apiDefinition;
    let websockets = apiDefinition.websockets;

    const subpackageTitle = apiDefinition.type === "subpackage" ? apiDefinition.title : undefined;

    if (websockets.length === 0) {
        websockets = [WEBSOCKET_MOCK];
    }

    return (
        <>
            {endpoints.map((endpoint, idx) => (
                <Endpoint
                    key={endpoint.id}
                    apiSection={apiSection}
                    apiDefinition={apiDefinition}
                    endpoint={endpoint}
                    subpackageTitle={subpackageTitle}
                    isLastInApi={
                        isLastInParentPackage &&
                        webhooks.length === 0 &&
                        subpackages.length === 0 &&
                        idx === endpoints.length - 1
                    }
                />
            ))}
            {websockets.map((websocket) => (
                <WebSocket key={websocket.id} websocket={websocket} />
            ))}
            {webhooks.map((webhook, idx) => (
                <Webhook
                    key={webhook.id}
                    webhook={webhook}
                    subpackageTitle={subpackageTitle}
                    isLastInApi={isLastInParentPackage && subpackages.length === 0 && idx === webhooks.length - 1}
                />
            ))}
            {subpackages.map((subpackage, idx) => (
                <ApiSubpackage
                    key={subpackage.id}
                    apiSection={apiSection}
                    apiDefinition={subpackage}
                    isLastInParentPackage={isLastInParentPackage && idx === subpackages.length - 1}
                    anchorIdParts={anchorIdParts}
                />
            ))}
        </>
    );
};
