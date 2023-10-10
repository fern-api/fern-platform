import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

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
    | DocsNode.Endpoint
    | DocsNode.Webhook
    | DocsNode.Page;

export type DocsNodeType = DocsNode["type"];

export type NavigatableDocsNode = DocsNode.Endpoint | DocsNode.Webhook | DocsNode.Page;
export type ChildDocsNode = Exclude<DocsNode, DocsNode.Root>;
export type ParentDocsNode = Exclude<DocsNode, NavigatableDocsNode>;

export interface DocsNodeVersion {
    id: string;
    slug: ItemSlug;
    index: number;
}

export interface DocsNodeTab {
    slug: ItemSlug;
    /** The 0-based index of the tab. */
    index: number;
}

export type DefinitionInfo = DefinitionInfo.Unversioned | DefinitionInfo.Versioned;

export declare namespace DefinitionInfo {
    export interface Unversioned {
        type: "unversioned";
    }

    export interface Versioned {
        type: "versioned";
        defaultVersionNode: DocsNode.Version;
    }
}

export declare namespace DocsNode {
    export interface Root extends BaseNode {
        type: "root";
        children: Map<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
        info: DefinitionInfo;
    }

    export interface Version extends BaseNode {
        type: "version";
        version: DocsNodeVersion;
        children: Map<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface Tab extends BaseNode {
        type: "tab";
        version: DocsNodeVersion | null;
        children: Map<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface DocsSection extends BaseNode {
        type: "docs-section";
        version: DocsNodeVersion | null;
        tab: DocsNodeTab | null;
        section: FernRegistryDocsRead.DocsSection;
        children: Map<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface ApiSection extends BaseNode {
        type: "api-section";
        version: DocsNodeVersion | null;
        tab: DocsNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        children: Map<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface ApiSubpackage extends BaseNode {
        type: "api-subpackage";
        version: DocsNodeVersion | null;
        tab: DocsNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Map<FullSlug, ChildDocsNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface Endpoint extends BaseNode, NavigatableNode {
        type: "endpoint";
        version: DocsNodeVersion | null;
        tab: DocsNodeTab | null;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface Webhook extends BaseNode, NavigatableNode {
        type: "webhook";
        version: DocsNodeVersion | null;
        tab: DocsNodeTab | null;
        webhook: FernRegistryApiRead.WebhookDefinition;
    }

    export interface Page extends BaseNode, NavigatableNode {
        type: "page";
        version: DocsNodeVersion | null;
        tab: DocsNodeTab | null;
        page: FernRegistryDocsRead.PageMetadata;
    }
}
