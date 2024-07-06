import type { FernNavigation } from "@fern-api/fdr-sdk";
import type { BundledMDX } from "../mdx/bundler";
import type { ResolvedRootPackage } from "./types";

export declare namespace ResolvedPath {
    export interface Neighbor {
        fullSlug: string;
        title: string;
        excerpt: BundledMDX | undefined;
    }

    export interface Neighbors {
        prev: Neighbor | null;
        next: Neighbor | null;
    }

    interface RedirectPage {
        type: "redirect";
        fullSlug: string;
    }

    interface ChangelogPage {
        type: "changelog";
        pages: Record<FernNavigation.PageId, BundledMDX>;
        node: FernNavigation.ChangelogNode;
        sectionTitleBreadcrumbs: string[];
        fullSlug: string;
        // neighbors: Neighbors;
    }

    interface ChangelogEntryPage {
        type: "changelog-entry";
        changelogTitle: string;
        changelogSlug: string;
        pages: Record<FernNavigation.PageId, BundledMDX>;
        node: FernNavigation.ChangelogEntryNode;
        sectionTitleBreadcrumbs: string[];
        neighbors: Neighbors;
        fullSlug: string;
    }

    interface CustomMarkdownPage {
        type: "custom-markdown-page";
        fullSlug: string;
        title: string;
        serializedMdxContent: BundledMDX;
        neighbors: Neighbors;
        // TODO: downselect apis to only the fields we need
        apis: Record<string, ResolvedRootPackage>;
    }

    interface ApiPage {
        type: "api-page";
        fullSlug: string;
        api: string;
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
// | ResolvedPath.RedirectPage;
