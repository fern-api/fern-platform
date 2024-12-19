import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { UnreachableCaseError } from "ts-essentials";
import { DocsContent } from "../resolver/DocsContent";

// TODO: implemenet suspense so that dynamic imports do not break the page layout on load
const ApiSectionMarkdownPage = dynamic(
    () =>
        import("./ApiSectionMarkdownPage").then(
            ({ ApiSectionMarkdownPage }) => ApiSectionMarkdownPage
        ),
    { ssr: true }
);
const Endpoint = dynamic(
    () => import("./endpoints/Endpoint").then(({ Endpoint }) => Endpoint),
    { ssr: true }
);
const Webhook = dynamic(
    () => import("./webhooks/Webhook").then(({ Webhook }) => Webhook),
    { ssr: true }
);
const WebSocket = dynamic(
    () => import("./web-socket/WebSocket").then(({ WebSocket }) => WebSocket),
    { ssr: true }
);
const EndpointPair = dynamic(
    () =>
        import("./endpoints/EndpointPair").then(
            ({ EndpointPair }) => EndpointPair
        ),
    {
        ssr: true,
    }
);

export type ApiPackageContentNode =
    | FernNavigation.ApiReferenceNode
    | Exclude<FernNavigation.ApiPackageChild, FernNavigation.LinkNode>;

export function isApiPackageContentNode(
    node: FernNavigation.NavigationNode
): node is ApiPackageContentNode {
    return (
        node.type === "apiReference" ||
        node.type === "apiPackage" ||
        node.type === "endpoint" ||
        node.type === "webhook" ||
        node.type === "webSocket" ||
        node.type === "page" ||
        node.type === "endpointPair"
    );
}

interface ApiPackageContentProps {
    node: ApiPackageContentNode;
    apiDefinition: ApiDefinition;
    breadcrumb: readonly FernNavigation.BreadcrumbItem[];
    mdxs: Record<
        FernNavigation.NodeId,
        Omit<DocsContent.MarkdownPage, "type" | "apis">
    >;
    showErrors: boolean;
    last?: boolean;
}

export function ApiPackageContent(props: ApiPackageContentProps): ReactNode {
    const { node, mdxs, apiDefinition, breadcrumb, showErrors, last } = props;

    switch (node.type) {
        case "apiReference":
        case "apiPackage": {
            if (FernNavigation.hasMarkdown(node)) {
                return (
                    <ApiSectionMarkdownPage
                        node={node}
                        mdxs={mdxs}
                        last={last}
                    />
                );
            }
            return null;
        }
        case "endpoint":
            return (
                <Endpoint
                    node={node}
                    apiDefinition={apiDefinition}
                    breadcrumb={breadcrumb}
                    showErrors={showErrors}
                    last={last}
                />
            );
        case "webhook":
            return (
                <Webhook
                    node={node}
                    apiDefinition={apiDefinition}
                    breadcrumb={breadcrumb}
                    last={last}
                />
            );
        case "webSocket":
            return (
                <WebSocket
                    node={node}
                    apiDefinition={apiDefinition}
                    breadcrumb={breadcrumb}
                    last={last}
                />
            );
        case "page":
            return (
                <ApiSectionMarkdownPage node={node} mdxs={mdxs} last={last} />
            );
        case "endpointPair":
            return (
                <EndpointPair
                    node={node}
                    apiDefinition={apiDefinition}
                    breadcrumb={breadcrumb}
                    showErrors={showErrors}
                    last={last}
                />
            );
        default:
            throw new UnreachableCaseError(node);
    }
}
