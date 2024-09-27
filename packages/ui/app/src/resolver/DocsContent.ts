import type { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { ResolvedApiEndpoint, ResolvedRootPackage, ResolvedTypeDefinition } from "./types";

export declare namespace DocsContent {
    export interface Neighbor {
        slug: FernNavigation.Slug;
        title: string;
        excerpt: FernDocs.MarkdownText | undefined;
    }

    export interface Neighbors {
        prev: Neighbor | null;
        next: Neighbor | null;
    }

    interface ChangelogPage {
        type: "changelog";
        title: string;
        pages: Record<FernNavigation.PageId, FernDocs.MarkdownText>;
        node: FernNavigation.ChangelogNode;
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        slug: FernNavigation.Slug;
        anchorIds: Record<string, FernNavigation.PageId>;
        // neighbors: Neighbors;
    }

    interface ChangelogEntryPage extends Omit<FernNavigation.ChangelogEntryNode, "type"> {
        type: "changelog-entry";
        page: FernDocs.MarkdownText;
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        neighbors: Neighbors;
        changelogTitle: string;
        changelogSlug: FernNavigation.Slug;
    }

    interface CustomMarkdownPage {
        type: "custom-markdown-page";
        slug: FernNavigation.Slug;
        title: string;
        mdx: FernDocs.MarkdownText;
        neighbors: Neighbors;
        // TODO: downselect apis to only the fields we need
        apis: Record<string, ResolvedRootPackage>;
    }

    interface ApiEndpointPage {
        type: "api-endpoint-page";
        slug: FernNavigation.Slug;
        api: FdrAPI.ApiDefinitionId;
        auth: APIV1Read.ApiAuth | undefined;
        types: Record<string, ResolvedTypeDefinition>;
        item: ResolvedApiEndpoint;
        showErrors: boolean;
        neighbors: Neighbors;
    }

    interface ApiReferencePage {
        type: "api-reference-page";
        title: string;
        slug: FernNavigation.Slug;
        api: string;
        paginated: boolean;
        apiDefinition: ResolvedRootPackage;
        showErrors: boolean;
    }
}

export type DocsContent =
    | DocsContent.CustomMarkdownPage
    | DocsContent.ApiEndpointPage
    | DocsContent.ApiReferencePage
    | DocsContent.ChangelogPage
    | DocsContent.ChangelogEntryPage;
