import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export interface DocsDefinitionSummary {
    docsConfig: FernRegistryDocsRead.DocsConfig;
    apis: Record<FernRegistryApiRead.ApiDefinition["id"], FernRegistryApiRead.ApiDefinition>;
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
    navigationConfig: FernRegistryDocsRead.UnversionedUntabbedNavigationConfig;
    version: null;
    tab: null;
}

export interface NodeDocsContextUnversionedTabbed {
    type: "unversioned-tabbed";
    root: DocsNode.Root;
    navigationConfig: FernRegistryDocsRead.UnversionedTabbedNavigationConfig;
    version: null;
    tab: DocsNode.Tab;
}

export interface NodeDocsContextVersionedUntabbed {
    type: "versioned-untabbed";
    root: DocsNode.Root;
    navigationConfig: FernRegistryDocsRead.UnversionedUntabbedNavigationConfig;
    version: DocsNode.Version;
    tab: null;
}

export interface NodeDocsContextVersionedTabbed {
    type: "versioned-tabbed";
    root: DocsNode.Root;
    navigationConfig: FernRegistryDocsRead.UnversionedTabbedNavigationConfig;
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
    availability: FernRegistryDocsRead.VersionAvailability | null;
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
        items: FernRegistryDocsRead.NavigationItem[];
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface DocsSection extends BaseNode {
        type: "docs-section";
        section: FernRegistryDocsRead.DocsSection;
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        context: NodeDocsContext;
    }

    export interface ApiSection extends BaseNode {
        type: "api-section";
        section: FernRegistryDocsRead.ApiSection;
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        context: NodeDocsContext;
    }

    export interface ApiSubpackage extends BaseNode {
        type: "api-subpackage";
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Record<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        context: NodeDocsContext;
    }

    export interface TopLevelEndpoint extends BaseNode, NavigatableNode {
        type: "top-level-endpoint";
        endpoint: FernRegistryApiRead.EndpointDefinition;
        section: FernRegistryDocsRead.ApiSection;
        context: NodeDocsContext;
    }

    export interface Endpoint extends BaseNode, NavigatableNode {
        type: "endpoint";
        endpoint: FernRegistryApiRead.EndpointDefinition;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }

    export interface TopLevelWebhook extends BaseNode, NavigatableNode {
        type: "top-level-webhook";
        webhook: FernRegistryApiRead.WebhookDefinition;
        section: FernRegistryDocsRead.ApiSection;
        context: NodeDocsContext;
    }

    export interface Webhook extends BaseNode, NavigatableNode {
        type: "webhook";
        webhook: FernRegistryApiRead.WebhookDefinition;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        context: NodeDocsContext;
    }

    export interface Page extends BaseNode, NavigatableNode {
        type: "page";
        page: FernRegistryDocsRead.PageMetadata;
        context: NodeDocsContext;
    }
}

export interface NodeNeighbors {
    previous: DocsNode | null;
    next: DocsNode | null;
}
