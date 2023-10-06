import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

/**
 * A slug is a string like `"introduction/getting-started"` with no leading `"/"`
 */
export type UrlSlug = string;

export interface BaseNode {
    /**
     * Represents a slug part e.g. `getting-started`.
     */
    slug: string;
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
        children: Map<UrlSlug, ResolvedNode>;
        childrenOrdering: UrlSlug[];
    }

    export interface Version extends BaseNode {
        type: "version";
        version: ResolvedNodeVersion;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version>>;
        childrenOrdering: UrlSlug[];
    }

    export interface Tab extends BaseNode {
        type: "tab";
        version: ResolvedNodeVersion | null;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version>>;
        childrenOrdering: UrlSlug[];
    }

    export interface DocsSection extends BaseNode {
        type: "docs-section";
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        section: FernRegistryDocsRead.DocsSection;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version | ResolvedNode.Tab>>;
        childrenOrdering: UrlSlug[];
    }

    export interface ApiSection extends BaseNode {
        type: "api-section";
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version | ResolvedNode.Tab>>;
        childrenOrdering: UrlSlug[];
    }

    export interface ApiSubpackage extends BaseNode {
        type: "api-subpackage";
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version | ResolvedNode.Tab>>;
        childrenOrdering: UrlSlug[];
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
