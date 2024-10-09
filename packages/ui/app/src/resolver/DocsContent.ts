import type { ApiDefinition } from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

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
        mdx: FernDocs.MarkdownText;
        neighbors: Neighbors;
        // TODO: downselect apis to only the fields we need
        apis: Record<FernNavigation.ApiDefinitionId, ApiDefinition>;
    }

    interface ApiEndpointPage {
        type: "api-endpoint-page";
        slug: FernNavigation.Slug;
        nodeId: FernNavigation.NodeId;
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        apiDefinition: ApiDefinition;
        showErrors: boolean;
        neighbors: Neighbors;
    }

    // TODO: it's a bit excessive to resolve and send all the pages here rather than simply stream them
    interface ApiReferencePage {
        type: "api-reference-page";
        slug: FernNavigation.Slug;
        title?: string;
        mdxs: Record<FernNavigation.NodeId, FernDocs.MarkdownText>;

        // TODO: the api reference node is probably duplicated in the initial props
        // so we should deduplicate it to avoid sending it twice
        breadcrumb: readonly FernNavigation.BreadcrumbItem[]; // this is the breadcrumb up to the api reference node
        apiReferenceNodeId: FernNavigation.NodeId;
        apiDefinition: ApiDefinition;
    }
}

export type DocsContent =
    | DocsContent.CustomMarkdownPage
    | DocsContent.ApiEndpointPage
    | DocsContent.ApiReferencePage
    | DocsContent.ChangelogPage
    | DocsContent.ChangelogEntryPage;
