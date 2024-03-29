import { FdrAPI } from "@fern-api/fdr-sdk";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import {
    isResolvedSubpackage,
    ResolvedPackageItem,
    ResolvedTypeDefinition,
    ResolvedWithApiDefinition,
} from "../util/resolver";
import { ApiPackageSummary } from "./ApiPackageSummary";
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
    const { items } = apiDefinition;
    const subpackageTitle = isResolvedSubpackage(apiDefinition) ? apiDefinition.title : undefined;
    const currentBreadcrumbs = subpackageTitle != null ? [...breadcrumbs, subpackageTitle] : breadcrumbs;

    return (
        <>
            <ApiPackageSummary
                apiDefinition={apiDefinition}
                breadcrumbs={breadcrumbs}
                isLastInApi={isLastInParentPackage && items.length === 0}
            />

            {items.map((item, idx) => (
                <FernErrorBoundary component="ApiPackageContents" key={item.id}>
                    {ResolvedPackageItem.visit(item, {
                        endpoint: (endpoint) => (
                            <Endpoint
                                api={api}
                                showErrors={showErrors}
                                endpoint={endpoint}
                                breadcrumbs={currentBreadcrumbs}
                                isLastInApi={isLastInParentPackage && idx === items.length - 1}
                                types={types}
                            />
                        ),
                        webhook: (webhook) => (
                            <Webhook
                                key={webhook.id}
                                webhook={webhook}
                                breadcrumbs={breadcrumbs}
                                isLastInApi={isLastInParentPackage && idx === items.length - 1}
                                types={types}
                            />
                        ),
                        websocket: (websocket) => (
                            <WebSocket
                                api={api}
                                websocket={websocket}
                                isLastInApi={isLastInParentPackage && idx === items.length - 1}
                                types={types}
                            />
                        ),
                        subpackage: (subpackage) => (
                            <ApiSubpackage
                                api={api}
                                types={types}
                                showErrors={showErrors}
                                apiDefinition={subpackage}
                                isLastInParentPackage={isLastInParentPackage && idx === items.length - 1}
                                anchorIdParts={anchorIdParts}
                                breadcrumbs={currentBreadcrumbs}
                            />
                        ),
                    })}
                </FernErrorBoundary>
            ))}
        </>
    );
};
