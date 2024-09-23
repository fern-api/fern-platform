import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import dynamic from "next/dynamic";
import { memo } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { ApiSectionMarkdownPage } from "./ApiSectionMarkdownPage";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";

const Endpoint = dynamic(() => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint), { ssr: true });
const Webhook = dynamic(() => import("./webhooks/Webhook").then(({ Webhook }) => Webhook), { ssr: true });
const WebSocket = dynamic(() => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket), { ssr: true });

export declare namespace ApiPackageContents {
    export interface Props {
        api: ApiDefinition.ApiDefinition;
        showErrors: boolean;
        node: FernNavigation.ApiPackageNode | FernNavigation.ApiReferenceNode;
        isLastInParentPackage: boolean;
        anchorIdParts: readonly string[];
        breadcrumbs?: readonly string[];
    }
}

const UnmemoizedApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    api,
    showErrors,
    node,
    isLastInParentPackage,
    anchorIdParts,
    // breadcrumbs = EMPTY_ARRAY,
}) => {
    // const { items } = apiDefinition;
    // const subpackageTitle = isApiDefinition.Subpackage(apiDefinition) ? apiDefinition.title : undefined;
    // const currentBreadcrumbs = useMemo(
    //     () => (subpackageTitle != null ? [...breadcrumbs, subpackageTitle] : breadcrumbs),
    //     [breadcrumbs, subpackageTitle],
    // );

    return (
        <>
            {node.children.map((item, idx) => (
                <FernErrorBoundary component="ApiPackageContents" key={node.slug}>
                    {visitDiscriminatedUnion(item)._visit({
                        endpoint: (endpoint) => (
                            <Endpoint
                                api={api}
                                showErrors={showErrors}
                                endpoint={api.endpoints[endpoint.id]}
                                isLastInApi={isLastInParentPackage && idx === node.children.length - 1}
                            />
                        ),
                        webhook: (webhook) => (
                            <Webhook
                                key={webhook.id}
                                webhook={webhook}
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
                                // breadcrumbs={currentBreadcrumbs}
                            />
                        ),
                        page: (page) => (
                            <ApiSectionMarkdownPage
                                page={page}
                                hideBottomSeparator={isLastInParentPackage && idx === items.length - 1}
                            />
                        ),
                    })}
                </FernErrorBoundary>
            ))}
        </>
    );
};

export const ApiPackageContents = memo(UnmemoizedApiPackageContents);
