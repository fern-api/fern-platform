import type { FdrAPI } from "@fern-api/fdr-sdk/client/types";
import { EMPTY_ARRAY } from "@fern-api/ui-core-utils";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import {
    ResolvedPackageItem,
    ResolvedTypeDefinition,
    ResolvedWithApiDefinition,
    isResolvedSubpackage,
} from "../resolver/types";
import { ApiSectionMarkdownPage } from "./ApiSectionMarkdownPage";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";

const Endpoint = dynamic(() => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint), { ssr: true });
const Webhook = dynamic(() => import("./webhooks/Webhook").then(({ Webhook }) => Webhook), { ssr: true });
const WebSocket = dynamic(() => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket), { ssr: true });

export declare namespace ApiPackageContents {
    export interface Props {
        api: FdrAPI.ApiDefinitionId;
        types: Record<string, ResolvedTypeDefinition>;
        showErrors: boolean;
        apiDefinition: ResolvedWithApiDefinition;
        isLastInParentPackage: boolean;
        anchorIdParts: readonly string[];
        breadcrumb?: readonly string[];
    }
}

const UnmemoizedApiPackageContents: React.FC<ApiPackageContents.Props> = ({
    api,
    types,
    showErrors,
    apiDefinition,
    isLastInParentPackage,
    anchorIdParts,
    breadcrumb = EMPTY_ARRAY,
}) => {
    const { items } = apiDefinition;
    const subpackageTitle = isResolvedSubpackage(apiDefinition) ? apiDefinition.title : undefined;
    const currentBreadcrumbs = useMemo(
        () => (subpackageTitle != null ? [...breadcrumb, subpackageTitle] : breadcrumb),
        [breadcrumb, subpackageTitle],
    );

    return (
        <>
            {items.map((item, idx) => (
                <FernErrorBoundary component="ApiPackageContents" key={item.slug}>
                    {ResolvedPackageItem.visit(item, {
                        endpoint: (endpoint) => (
                            <Endpoint
                                api={api}
                                showErrors={showErrors}
                                endpoint={endpoint}
                                isLastInApi={isLastInParentPackage && idx === items.length - 1}
                                types={types}
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
                                breadcrumb={currentBreadcrumbs}
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
