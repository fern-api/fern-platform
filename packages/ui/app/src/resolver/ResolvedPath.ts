import { FernNavigation } from "@fern-api/fdr-sdk";
import type { BundledMDX } from "../mdx/types";
import { ResolvedRootPackage } from "./types";

export declare namespace ResolvedPath {
    export interface Neighbor {
        slug: string;
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

    interface ChangelogEntryPage {
        type: "changelog-entry";
        page: BundledMDX;
        node: FernNavigation.ChangelogEntryNode;
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

    interface ApiPage {
        type: "api-page";
        title: string;
        slug: FernNavigation.Slug;
        api: string;
        disableLongScrolling: boolean;
        apiDefinition: ResolvedRootPackage;
        showErrors: boolean;
        neighbors: Neighbors;
    }
}

export type ResolvedPath =
    | ResolvedPath.CustomMarkdownPage
    | ResolvedPath.ApiPage
    | ResolvedPath.ChangelogPage
    | ResolvedPath.ChangelogEntryPage;
