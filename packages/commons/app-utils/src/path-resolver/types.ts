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

export type ResolvedNode =
    | ResolvedNode.Root
    | ResolvedNode.Version
    | ResolvedNode.Tab
    | ResolvedNode.DocsSection
    | ResolvedNode.ApiSection
    | ResolvedNode.ApiSubpackage
    | ResolvedNode.Endpoint
    | ResolvedNode.Page;

export type ResolvedNavigatableNode = ResolvedNode.Endpoint | ResolvedNode.Page;
export type ResolvedChildNode = Exclude<ResolvedNode, ResolvedNode.Root>;
export type ResolvedParentNode = Exclude<ResolvedNode, ResolvedNavigatableNode>;

export interface ResolvedNodeVersion {
    id: string;
    slug: string;
}

export interface ResolvedNodeTab {
    slug: string;
    /** The 0-based index of the tab. */
    index: number;
}

export declare namespace ResolvedNode {
    export interface Root extends BaseNode {
        type: "root";
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface Version extends BaseNode {
        type: "version";
        version: ResolvedNodeVersion;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface Tab extends BaseNode {
        type: "tab";
        version: ResolvedNodeVersion | null;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface DocsSection extends BaseNode {
        type: "docs-section";
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        section: FernRegistryDocsRead.DocsSection;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface ApiSection extends BaseNode {
        type: "api-section";
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface ApiSubpackage extends BaseNode {
        type: "api-subpackage";
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface Endpoint extends BaseNode {
        type: "endpoint";
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface Page extends BaseNode {
        type: "page";
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        page: FernRegistryDocsRead.PageMetadata;
    }
}
