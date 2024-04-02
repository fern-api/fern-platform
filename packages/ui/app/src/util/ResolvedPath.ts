import { DocsV1Read } from "@fern-api/fdr-sdk";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { SerializedMdxContent } from "../mdx/mdx";
import { ResolvedRootPackage } from "./resolver";

export declare namespace ResolvedPath {
    export interface Neighbor {
        fullSlug: string;
        title: string;
        excerpt: MDXRemoteSerializeResult | string | undefined;
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
        type: "changelog-page";
        fullSlug: string;
        title: string;
        sectionTitleBreadcrumbs: string[];
        markdown: SerializedMdxContent | null;
        editThisPageUrl: string | null;
        items: {
            date: string;
            dateString: string;
            markdown: SerializedMdxContent;
            editThisPageUrl: string | null;
        }[];
        neighbors: Neighbors;
    }

    interface CustomMarkdownPage {
        type: "custom-markdown-page";
        fullSlug: string;
        title: string;
        sectionTitleBreadcrumbs: string[];
        serializedMdxContent: SerializedMdxContent;
        editThisPageUrl: string | null;
        neighbors: Neighbors;
        // TODO: downselect apis to only the fields we need
        apis: Record<string, ResolvedRootPackage>;
    }

    interface ApiPage {
        type: "api-page";
        fullSlug: string;
        api: string;
        apiDefinition: ResolvedRootPackage;
        artifacts: DocsV1Read.ApiArtifacts | null;
        showErrors: boolean;
        neighbors: Neighbors;
    }
}

export type ResolvedPath =
    | ResolvedPath.CustomMarkdownPage
    | ResolvedPath.ApiPage
    | ResolvedPath.ChangelogPage
    | ResolvedPath.RedirectPage;
