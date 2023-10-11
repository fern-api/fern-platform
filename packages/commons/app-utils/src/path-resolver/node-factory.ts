import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { DocsNode, VersionInfo, NodeDocsContext } from "./types";

export class NodeFactory {
    public static createRoot(definition: FernRegistryDocsRead.DocsDefinition): DocsNode.Root {
        return {
            type: "root",
            slug: "",
            children: {},
            childrenOrdering: [],
            info: { type: "unversioned", definition },
        };
    }

    public static createVersion({ slug, info }: { slug: string; info: VersionInfo }): DocsNode.Version {
        return {
            type: "version",
            slug,
            info,
            children: {},
            childrenOrdering: [],
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
        items: FernRegistryDocsRead.NavigationItem[];
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
        section: FernRegistryDocsRead.DocsSection;
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
        section: FernRegistryDocsRead.ApiSection;
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
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
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
        endpoint,
        section,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
        section: FernRegistryDocsRead.ApiSection;
        context: NodeDocsContext;
    }): DocsNode.TopLevelEndpoint {
        return {
            type: "top-level-endpoint",
            slug,
            leadingSlug,
            endpoint,
            section,
            context,
        };
    }

    public static createEndpoint({
        slug,
        leadingSlug,
        endpoint,
        section,
        subpackage,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }): DocsNode.Endpoint {
        return {
            type: "endpoint",
            slug,
            leadingSlug,
            endpoint,
            section,
            subpackage,
            context,
        };
    }

    public static createTopLevelWebhook({
        slug,
        leadingSlug,
        webhook,
        section,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        webhook: FernRegistryApiRead.WebhookDefinition;
        section: FernRegistryDocsRead.ApiSection;
        context: NodeDocsContext;
    }): DocsNode.TopLevelWebhook {
        return {
            type: "top-level-webhook",
            slug,
            leadingSlug,
            webhook,
            section,
            context,
        };
    }

    public static createWebhook({
        slug,
        leadingSlug,
        webhook,
        section,
        subpackage,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        webhook: FernRegistryApiRead.WebhookDefinition;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }): DocsNode.Webhook {
        return {
            type: "webhook",
            slug,
            leadingSlug,
            webhook,
            section,
            subpackage,
            context,
        };
    }

    public static createPage({
        slug,
        leadingSlug,
        page,
        context,
    }: {
        slug: string;
        leadingSlug: string;
        page: FernRegistryDocsRead.PageMetadata;
        context: NodeDocsContext;
    }): DocsNode.Page {
        return {
            type: "page",
            slug,
            leadingSlug,
            page,
            context,
        };
    }
}
