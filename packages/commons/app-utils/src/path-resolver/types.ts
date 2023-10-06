import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

/**
 * A slug is a string like `"introduction/getting-started"` with no leading `"/"`
 */
export type UrlSlug = string;

export type ResolvedNode =
    | ResolvedNode.Version
    | ResolvedNode.Tab
    | ResolvedNode.DocsSection
    | ResolvedNode.ApiSection
    | ResolvedNode.ApiSubpackage
    | ResolvedNode.Endpoint
    | ResolvedNode.Page;

export type ResolvedNavigatableNode = ResolvedNode.Endpoint | ResolvedNode.Page;

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
    export interface Version {
        type: "version";
        slug: string;
        version: ResolvedNodeVersion;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version>>;
    }

    export interface Tab {
        type: "tab";
        slug: string;
        version: ResolvedNodeVersion | null;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version>>;
    }

    export interface DocsSection {
        type: "docs-section";
        slug: string;
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        section: FernRegistryDocsRead.DocsSection;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version | ResolvedNode.Tab>>;
    }

    export interface ApiSection {
        type: "api-section";
        slug: string;
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        section: FernRegistryDocsRead.ApiSection;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version | ResolvedNode.Tab>>;
    }

    export interface ApiSubpackage {
        type: "api-subpackage";
        slug: string;
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        children: Map<UrlSlug, Exclude<ResolvedNode, ResolvedNode.Version | ResolvedNode.Tab>>;
    }

    export interface Endpoint {
        type: "endpoint";
        slug: string;
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }

    export interface Page {
        type: "page";
        slug: string;
        version: ResolvedNodeVersion | null;
        tab: ResolvedNodeTab | null;
        page: FernRegistryDocsRead.PageMetadata;
    }
}
