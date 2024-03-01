import { FdrAPI } from "@fern-api/fdr-sdk";
import { isResolvedSubpackage, ResolvedTypeDefinition, ResolvedWithApiDefinition } from "../util/resolver";
import { Endpoint } from "./endpoints/Endpoint";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";
import { WebSocket } from "./web-socket/WebSocket";
import { Webhook } from "./webhooks/Webhook";

export declare namespace ApiPackageContents {
    export interface Props {
        api: FdrAPI.ApiDefinitionId;
        types: Record<string, ResolvedTypeDefinition>;
        showErrors: boolean;
        apiDefinition: ResolvedWithApiDefinition;
        isLastInParentPackage: boolean;
        anchorIdParts: string[];
        breadcrumbs?: string[];
    }
}

export const ApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    api,
    types,
    showErrors,
    apiDefinition,
    isLastInParentPackage,
    anchorIdParts,
    breadcrumbs = [],
}) => {
    const { endpoints, webhooks, websockets, subpackages } = apiDefinition;

    const subpackageTitle = isResolvedSubpackage(apiDefinition) ? apiDefinition.title : undefined;
    const currentBreadcrumbs = subpackageTitle != null ? [...breadcrumbs, subpackageTitle] : breadcrumbs;

    return (
        <>
            {endpoints.map((endpoint, idx) => (
                <Endpoint
                    key={endpoint.id}
                    api={api}
                    showErrors={showErrors}
                    endpoint={endpoint}
                    breadcrumbs={currentBreadcrumbs}
                    isLastInApi={
                        isLastInParentPackage &&
                        webhooks.length === 0 &&
                        subpackages.length === 0 &&
                        idx === endpoints.length - 1
                    }
                    types={types}
                />
            ))}
            {websockets.map((websocket, idx) => (
                <WebSocket
                    key={websocket.id}
                    api={api}
                    websocket={websocket}
                    isLastInApi={isLastInParentPackage && subpackages.length === 0 && idx === websockets.length - 1}
                    types={types}
                />
            ))}
            {webhooks.map((webhook, idx) => (
                <Webhook
                    key={webhook.id}
                    webhook={webhook}
                    breadcrumbs={breadcrumbs}
                    isLastInApi={isLastInParentPackage && subpackages.length === 0 && idx === webhooks.length - 1}
                    types={types}
                />
            ))}
            {subpackages.map((subpackage, idx) => (
                <ApiSubpackage
                    key={subpackage.id}
                    api={api}
                    types={types}
                    showErrors={showErrors}
                    apiDefinition={subpackage}
                    isLastInParentPackage={isLastInParentPackage && idx === subpackages.length - 1}
                    anchorIdParts={anchorIdParts}
                    breadcrumbs={currentBreadcrumbs}
                />
            ))}
        </>
    );
};
