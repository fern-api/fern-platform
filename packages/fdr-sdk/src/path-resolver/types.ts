import { APIV1Read, DocsV1Read } from "../client";

export interface DocsDefinitionSummary {
    docsConfig: DocsV1Read.DocsConfig;
    apis: Record<APIV1Read.ApiDefinition["id"], APIV1Read.ApiDefinition>;
    basePath?: string;
}

/**
 * Represents a slug part like `getting-started` with no leading `"/"`
 */
export type ItemSlug = string;

/**
 * A full slug is a complete slug string for a page like `"introduction/getting-started"` with no leading `"/"`
 */
export type FullSlug = string;

export interface BaseNode {
    slug: ItemSlug;
}

interface NavigatableNode {
    /**
     * Path slug without version.
     */
    leadingSlug: FullSlug;

    /**
     * Slugs that should redirect to this node.
     */
    migratedSlugs: FullSlug[];
}

export type DocsNode =
    | DocsNode.Root
    | DocsNode.Version
    | DocsNode.Tab
    | DocsNode.DocsSection
    | DocsNode.ApiSection
    | DocsNode.ApiSubpackage
    | DocsNode.TopLevelEndpoint
    | DocsNode.Endpoint
    | DocsNode.TopLevelWebhook
    | DocsNode.Webhook
    | DocsNode.Page;

export type DocsNodeType = DocsNode["type"];

export type NavigatableDocsNode =
    | DocsNode.TopLevelEndpoint
    | DocsNode.Endpoint
    | DocsNode.TopLevelWebhook
    | DocsNode.Webhook
    | DocsNode.Page;
export type ApiDocsNode =
    | DocsNode.ApiSection
    | DocsNode.ApiSubpackage
    | DocsNode.TopLevelEndpoint
    | DocsNode.Endpoint
    | DocsNode.TopLevelWebhook
    | DocsNode.Webhook;
export type ChildDocsNode = Exclude<DocsNode, DocsNode.Root>;
export type ParentDocsNode = Exclude<DocsNode, NavigatableDocsNode>;

export interface NodeDocsContextUnversionedUntabbed {
    type: "unversioned-untabbed";
    root: DocsNode.Root;
    navigationConfig: DocsV1Read.UnversionedUntabbedNavigationConfig;
    version: null;
    tab: null;
}

export interface NodeDocsContextUnversionedTabbed {
    type: "unversioned-tabbed";
    root: DocsNode.Root;
    navigationConfig: DocsV1Read.UnversionedTabbedNavigationConfig;
    version: null;
    tab: DocsNode.Tab;
}

export interface NodeDocsContextVersionedUntabbed {
    type: "versioned-untabbed";
    root: DocsNode.Root;
    navigationConfig: DocsV1Read.UnversionedUntabbedNavigationConfig;
    version: DocsNode.Version;
    tab: null;
}

export interface NodeDocsContextVersionedTabbed {
    type: "versioned-tabbed";
    root: DocsNode.Root;
    navigationConfig: DocsV1Read.UnversionedTabbedNavigationConfig;
    version: DocsNode.Version;
    tab: DocsNode.Tab;
}

export type NodeDocsContext =
    | NodeDocsContextUnversionedUntabbed
    | NodeDocsContextUnversionedTabbed
    | NodeDocsContextVersionedUntabbed
    | NodeDocsContextVersionedTabbed;

export interface VersionInfo {
    id: string;
    slug: ItemSlug;
    index: number;
    availability: DocsV1Read.VersionAvailability | null;
}

export declare namespace DefinitionInfo {
    export interface Unversioned {
        type: "unversioned";
        definition: DocsDefinitionSummary;
    }

    export interface Versioned {
        type: "versioned";
        definition: DocsDefinitionSummary;
        defaultVersionNode: DocsNode.Version;
        versions: DocsNode.Version[];
    }
}

export type DefinitionInfo = DefinitionInfo.Unversioned | DefinitionInfo.Versioned;

export declare namespace TabInfo {
    export interface Untabbed {
        type: "untabbed";
    }

    export interface Tabbed {
        type: "tabbed";
        tabs: DocsNode.Tab[];
    }
}

export type TabInfo = TabInfo.Untabbed | TabInfo.Tabbed;

export declare namespace DocsNode {
    export interface Root extends BaseNode {
        type: "root";
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        info: DefinitionInfo;
    }

    export interface Version extends BaseNode {
        type: "version";
        info: VersionInfo;
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        tabInfo: TabInfo;
    }

    export interface Tab extends BaseNode {
        type: "tab";
        version: Version | null;
        index: number;
        items: DocsV1Read.NavigationItem[];
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface DocsSection extends BaseNode {
        type: "docs-section";
        section: DocsV1Read.DocsSection;
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        context: NodeDocsContext;
    }

    export interface ApiSection extends BaseNode {
        type: "api-section";
        section: DocsV1Read.ApiSection;
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        context: NodeDocsContext;
    }

    export interface ApiSubpackage extends BaseNode {
        type: "api-subpackage";
        section: DocsV1Read.ApiSection;
        subpackage: APIV1Read.ApiDefinitionSubpackage;
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        context: NodeDocsContext;
    }

    export interface TopLevelEndpoint extends BaseNode, NavigatableNode {
        type: "top-level-endpoint";
        endpoint: APIV1Read.EndpointDefinition;
        section: DocsV1Read.ApiSection;
        context: NodeDocsContext;
    }

    export interface Endpoint extends BaseNode, NavigatableNode {
        type: "endpoint";
        endpoint: APIV1Read.EndpointDefinition;
        section: DocsV1Read.ApiSection;
        subpackage: APIV1Read.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }

    export interface TopLevelWebhook extends BaseNode, NavigatableNode {
        type: "top-level-webhook";
        webhook: APIV1Read.WebhookDefinition;
        section: DocsV1Read.ApiSection;
        context: NodeDocsContext;
    }

    export interface Webhook extends BaseNode, NavigatableNode {
        type: "webhook";
        webhook: APIV1Read.WebhookDefinition;
        section: DocsV1Read.ApiSection;
        subpackage: APIV1Read.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }

    export interface Page extends BaseNode, NavigatableNode {
        type: "page";
        page: DocsV1Read.PageMetadata;
        section: DocsV1Read.DocsSection | null;
        context: NodeDocsContext;
    }
}

export interface NodeNeighbors {
    previous: DocsNode | null;
    next: DocsNode | null;
}
