import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { ApiSectionMarkdownPage } from "./ApiSectionMarkdownPage";
import { EndpointPair } from "./endpoints/EndpointPair";

const Endpoint = dynamic(() => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint), { ssr: true });
const Webhook = dynamic(() => import("./webhooks/Webhook").then(({ Webhook }) => Webhook), { ssr: true });
const WebSocket = dynamic(() => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket), { ssr: true });

export declare namespace ApiPackageContents {
    export interface Props {
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        apiDefinition: ApiDefinition;
        node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode;
        mdxs: Record<FernNavigation.NodeId, FernDocs.MarkdownText>;
        showErrors: boolean;
        isLastInParentPackage: boolean;
        anchorIdParts: readonly string[];
    }
}

const UnmemoizedApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    mdxs,
    breadcrumb,
    showErrors,
    apiDefinition,
    node,
    isLastInParentPackage,
    anchorIdParts,
}) => {
    const items = useMemo(
        () =>
            node.children.filter(
                (item): item is Exclude<FernNavigation.ApiPackageChild, FernNavigation.LinkNode> =>
                    item.type !== "link",
            ),
        [node.children],
    );

    return (
        <>
            {FernNavigation.hasMarkdown(node) && (
                <ApiSectionMarkdownPage node={node} mdxs={mdxs} hideBottomSeparator={false} />
            )}

            {items.map((item, idx) => {
                // TODO: memoize breadcrumb?
                const childBreadcrumb = [...breadcrumb, ...FernNavigation.utils.createBreadcrumb([node])];
                const isLastInApi = isLastInParentPackage && idx === node.children.length - 1;

                return (
                    <FernErrorBoundary component="ApiPackageContents" key={item.id}>
                        {visitDiscriminatedUnion(item)._visit({
                            endpoint: (endpoint) => (
                                <Endpoint
                                    node={endpoint}
                                    apiDefinition={apiDefinition}
                                    isLastInApi={isLastInApi}
                                    showErrors={showErrors}
                                    breadcrumb={childBreadcrumb}
                                />
                            ),
                            webhook: (webhook) => (
                                <Webhook
                                    node={webhook}
                                    apiDefinition={apiDefinition}
                                    isLastInApi={isLastInApi}
                                    breadcrumb={childBreadcrumb}
                                />
                            ),
                            webSocket: (webSocket) => (
                                <WebSocket
                                    node={webSocket}
                                    apiDefinition={apiDefinition}
                                    isLastInApi={isLastInApi}
                                    breadcrumb={childBreadcrumb}
                                />
                            ),
                            apiPackage: (pkg) => (
                                <ApiPackageContents
                                    mdxs={mdxs}
                                    apiDefinition={apiDefinition}
                                    node={pkg}
                                    showErrors={showErrors}
                                    breadcrumb={childBreadcrumb}
                                    isLastInParentPackage={isLastInApi}
                                    anchorIdParts={anchorIdParts}
                                />
                            ),
                            page: (page) => (
                                <ApiSectionMarkdownPage node={page} mdxs={mdxs} hideBottomSeparator={isLastInApi} />
                            ),
                            endpointPair: (pair) => (
                                <EndpointPair
                                    apiDefinition={apiDefinition}
                                    showErrors={showErrors}
                                    node={pair}
                                    breadcrumb={breadcrumb}
                                    isLastInApi={true}
                                />
                            ),
                        })}
                    </FernErrorBoundary>
                );
            })}
        </>
    );
};

export const ApiPackageContents = memo(UnmemoizedApiPackageContents);
