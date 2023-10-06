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

export type DefinitionNode =
    | DefinitionNode.Root
    | DefinitionNode.Version
    | DefinitionNode.Tab
    | DefinitionNode.DocsSection
    | DefinitionNode.ApiSection
    | DefinitionNode.ApiSubpackage
    | DefinitionNode.Endpoint
    | DefinitionNode.Page;

export type ResolvedNavigatableNode = DefinitionNode.Endpoint | DefinitionNode.Page;
export type ResolvedChildNode = Exclude<DefinitionNode, DefinitionNode.Root>;
export type ResolvedParentNode = Exclude<DefinitionNode, ResolvedNavigatableNode>;

export interface DefinitionNodeVersion {
    id: string;
    slug: string;
    index: number;
}

export interface DefinitionNodeTab {
    slug: string;
    /** The 0-based index of the tab. */
    index: number;
}

export declare namespace DefinitionNode {
    export interface Root extends BaseNode {
        type: "root";
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface Version extends BaseNode {
        type: "version";
        version: DefinitionNodeVersion;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface Tab extends BaseNode {
        type: "tab";
        version: DefinitionNodeVersion | null;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface DocsSection extends BaseNode {
        type: "docs-section";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        section: FernRegistryDocsRead.DocsSection;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface ApiSection extends BaseNode {
        type: "api-section";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface ApiSubpackage extends BaseNode {
        type: "api-subpackage";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Map<FullSlug, ResolvedChildNode>;
        childrenOrdering: FullSlug[];
    }

    export interface Endpoint extends BaseNode {
        type: "endpoint";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface Page extends BaseNode {
        type: "page";
        version: DefinitionNodeVersion | null;
        tab: DefinitionNodeTab | null;
        page: FernRegistryDocsRead.PageMetadata;
    }
}
