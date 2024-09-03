import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import type { BundledMDX } from "../mdx/types";
import { ResolvedApiDefinitionItem, ResolvedRootPackage, ResolvedTypeDefinition } from "./types";

export declare namespace ResolvedPath {
    export interface Neighbor {
        slug: FernNavigation.Slug;
        title: string;
        excerpt: BundledMDX | undefined;
    }

    export interface Neighbors {
        prev: Neighbor | null;
        next: Neighbor | null;
    }

    interface ChangelogPage {
        type: "changelog";
        title: string;
        pages: Record<FernNavigation.PageId, BundledMDX>;
        node: FernNavigation.ChangelogNode;
        sectionTitleBreadcrumbs: string[];
        slug: FernNavigation.Slug;
        // neighbors: Neighbors;
    }

    interface ChangelogEntryPage extends Omit<FernNavigation.ChangelogEntryNode, "type"> {
        type: "changelog-entry";
        page: BundledMDX;
        sectionTitleBreadcrumbs: string[];
        neighbors: Neighbors;
        changelogTitle: string;
        changelogSlug: FernNavigation.Slug;
    }

    interface CustomMarkdownPage {
        type: "custom-markdown-page";
        slug: FernNavigation.Slug;
        title: string;
        mdx: BundledMDX;
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
        item: ResolvedApiDefinitionItem;
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

export type ResolvedPath =
    | ResolvedPath.CustomMarkdownPage
    | ResolvedPath.ApiEndpointPage
    | ResolvedPath.ApiReferencePage
    | ResolvedPath.ChangelogPage
    | ResolvedPath.ChangelogEntryPage;
