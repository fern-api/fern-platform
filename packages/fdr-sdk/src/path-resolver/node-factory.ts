import { APIV1Read, DocsV1Read } from "../client";
import { DocsDefinitionSummary, DocsNode, NodeDocsContext, TabInfo, VersionInfo } from "./types";

export class NodeFactory {
    public static createRoot(definition: DocsDefinitionSummary): DocsNode.Root {
        return {
            type: "root",
            slug: "",
            children: {},
            childrenOrdering: [],
            info: { type: "unversioned", definition },
        };
    }

    public static createVersion({
        slug,
        info,
        tabInfo,
    }: {
        slug: string;
        info: VersionInfo;
        tabInfo: TabInfo;
    }): DocsNode.Version {
        return {
            type: "version",
            slug,
            info,
            children: {},
            childrenOrdering: [],
            tabInfo,
        };
    }

    public static createTab({
        slug,
        version,
        index,
        items,
    }: {
        slug: string;
        version?: DocsNode.Version | null;
        index: number;
        items: DocsV1Read.NavigationItem[];
    }): DocsNode.Tab {
        return {
            type: "tab",
            slug,
            version: version ?? null,
            index,
            items,
            children: {},
            childrenOrdering: [],
        };
    }

    public static createDocsSection({
        slug,
        section,
        context,
    }: {
        slug: string;
        section: DocsV1Read.DocsSection;
        context: NodeDocsContext;
    }): DocsNode.DocsSection {
        return {
            type: "docs-section",
            slug,
            section,
            children: {},
            childrenOrdering: [],
            context,
        };
    }

    public static createApiSection({
        slug,
        section,
        context,
    }: {
        slug: string;
        section: DocsV1Read.ApiSection;
        context: NodeDocsContext;
    }): DocsNode.ApiSection {
        return {
            type: "api-section",
            slug,
            section,
            children: {},
            childrenOrdering: [],
            context,
        };
    }

    public static createApiSubpackage({
        slug,
        section,
        subpackage,
        context,
    }: {
        slug: string;
        section: DocsV1Read.ApiSection;
        subpackage: APIV1Read.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }): DocsNode.ApiSubpackage {
        return {
            type: "api-subpackage",
            slug,
            section,
            subpackage,
            children: {},
            childrenOrdering: [],
            context,
        };
    }

    public static createTopLevelEndpoint({
        slug,
        leadingSlug,
        migratedSlugs,
        endpoint,
        section,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        migratedSlugs: string[];
        endpoint: APIV1Read.EndpointDefinition;
        section: DocsV1Read.ApiSection;
        context: NodeDocsContext;
    }): DocsNode.TopLevelEndpoint {
        return {
            type: "top-level-endpoint",
            slug,
            leadingSlug,
            migratedSlugs,
            endpoint,
            section,
            context,
        };
    }

    public static createEndpoint({
        slug,
        leadingSlug,
        migratedSlugs,
        endpoint,
        section,
        subpackage,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        migratedSlugs: string[];
        endpoint: APIV1Read.EndpointDefinition;
        section: DocsV1Read.ApiSection;
        subpackage: APIV1Read.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }): DocsNode.Endpoint {
        return {
            type: "endpoint",
            slug,
            leadingSlug,
            migratedSlugs,
            endpoint,
            section,
            subpackage,
            context,
        };
    }

    public static createTopLevelWebhook({
        slug,
        leadingSlug,
        migratedSlugs,
        webhook,
        section,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        migratedSlugs: string[];
        webhook: APIV1Read.WebhookDefinition;
        section: DocsV1Read.ApiSection;
        context: NodeDocsContext;
    }): DocsNode.TopLevelWebhook {
        return {
            type: "top-level-webhook",
            slug,
            leadingSlug,
            migratedSlugs,
            webhook,
            section,
            context,
        };
    }

    public static createWebhook({
        slug,
        leadingSlug,
        migratedSlugs,
        webhook,
        section,
        subpackage,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        migratedSlugs: string[];
        webhook: APIV1Read.WebhookDefinition;
        section: DocsV1Read.ApiSection;
        subpackage: APIV1Read.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }): DocsNode.Webhook {
        return {
            type: "webhook",
            slug,
            leadingSlug,
            migratedSlugs,
            webhook,
            section,
            subpackage,
            context,
        };
    }

    public static createTopLevelWebSocket({
        slug,
        leadingSlug,
        migratedSlugs,
        websocket,
        section,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        migratedSlugs: string[];
        websocket: APIV1Read.WebSocketChannel;
        section: DocsV1Read.ApiSection;
        context: NodeDocsContext;
    }): DocsNode.TopLevelWebSocket {
        return {
            type: "top-level-websocket",
            slug,
            leadingSlug,
            migratedSlugs,
            websocket,
            section,
            context,
        };
    }

    public static createWebSocket({
        slug,
        leadingSlug,
        migratedSlugs,
        websocket,
        section,
        subpackage,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        migratedSlugs: string[];
        websocket: APIV1Read.WebSocketChannel;
        section: DocsV1Read.ApiSection;
        subpackage: APIV1Read.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }): DocsNode.WebSocket {
        return {
            type: "websocket",
            slug,
            leadingSlug,
            migratedSlugs,
            websocket,
            section,
            subpackage,
            context,
        };
    }

    public static createPage({
        slug,
        leadingSlug,
        page,
        section,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        page: DocsV1Read.PageMetadata;
        section: DocsV1Read.DocsSection | null;
        context: NodeDocsContext;
    }): DocsNode.Page {
        return {
            type: "page",
            slug,
            leadingSlug,
            migratedSlugs: [],
            page,
            section,
            context,
        };
    }
}
