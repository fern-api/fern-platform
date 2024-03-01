import { DocsV1Read } from "@fern-api/fdr-sdk";
import { type SerializedMdxContent } from "./mdx";
import { ResolvedRootPackage } from "./resolver";

export declare namespace ResolvedPath {
    interface Neighbor {
        fullSlug: string;
        title: string;
    }

    interface Neighbors {
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
