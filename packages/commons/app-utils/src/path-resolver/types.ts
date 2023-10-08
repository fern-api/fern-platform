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

export interface NavigatableNode {
    /**
     * Path slug without version.
     */
    leadingSlug: FullSlug;
}

export type DefinitionNode =
    | DefinitionNode.Root
    | DefinitionNode.Version
    | DefinitionNode.Tab
    | DefinitionNode.DocsSection
    | DefinitionNode.ApiSection
    | DefinitionNode.ApiSubpackage
    | DefinitionNode.Endpoint
    | DefinitionNode.Webhook
    | DefinitionNode.Page;

export type DefinitionNodeType = DefinitionNode["type"];

export type NavigatableDefinitionNode = DefinitionNode.Endpoint | DefinitionNode.Webhook | DefinitionNode.Page;
export type ChildDefinitionNode = Exclude<DefinitionNode, DefinitionNode.Root>;
export type ParentDefinitionNode = Exclude<DefinitionNode, NavigatableDefinitionNode>;

export interface DefinitionNodeVersion {
    id: string;
    slug: ItemSlug;
    index: number;
}

export interface DefinitionNodeTab {
    slug: ItemSlug;
    /** The 0-based index of the tab. */
    index: number;
}

export type DefinitionInfo = DefinitionInfo.UnversionedUntabbed | DefinitionInfo.Versioned;

export declare namespace DefinitionInfo {
    export interface UnversionedUntabbed {
        type: "unversioned";
    }

    export interface Versioned {
        type: "versioned";
        defaultVersionNode: DefinitionNode.Version;
    }
}

export declare namespace DefinitionNode {
    export interface Root extends BaseNode {
        type: "root";
        children: Map<FullSlug, ChildDefinitionNode>;
        childrenOrdering: ItemSlug[];
        info: DefinitionInfo;
    }

    export interface Version extends BaseNode {
        type: "version";
        version: DefinitionNodeVersion;
        children: Map<FullSlug, ChildDefinitionNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface Tab extends BaseNode {
        type: "tab";
        version: DefinitionNodeVersion | null;
        children: Map<FullSlug, ChildDefinitionNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface DocsSection extends BaseNode {
        type: "docs-section";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        section: FernRegistryDocsRead.DocsSection;
        children: Map<FullSlug, ChildDefinitionNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface ApiSection extends BaseNode {
        type: "api-section";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        children: Map<FullSlug, ChildDefinitionNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface ApiSubpackage extends BaseNode {
        type: "api-subpackage";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Map<FullSlug, ChildDefinitionNode>;
        childrenOrdering: ItemSlug[];
    }

    export interface Endpoint extends BaseNode, NavigatableNode {
        type: "endpoint";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface Webhook extends BaseNode, NavigatableNode {
        type: "webhook";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        webhook: FernRegistryApiRead.WebhookDefinition;
    }

    export interface Page extends BaseNode, NavigatableNode {
        type: "page";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        page: FernRegistryDocsRead.PageMetadata;
    }
}
