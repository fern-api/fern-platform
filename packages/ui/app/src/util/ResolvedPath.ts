import { DocsV1Read } from "@fern-api/fdr-sdk";
import { type SerializedMdxContent } from "./mdx";
import { ResolvedNavigationItemApiSection } from "./resolver";

export declare namespace ResolvedPath {
    interface Neighbor {
        fullSlug: string;
        title: string;
    }

    interface Neighbors {
        prev: Neighbor | null;
        next: Neighbor | null;
    }

    interface CustomMarkdownPage {
        type: "custom-markdown-page";
        fullSlug: string;
        page: DocsV1Read.PageMetadata;
        sectionTitle: string | null;
        serializedMdxContent: SerializedMdxContent;
        editThisPageUrl: string | null;
        neighbors: Neighbors;
    }

    interface ApiPage {
        type: "api-page";
        fullSlug: string;
        apiSection: ResolvedNavigationItemApiSection;
        neighbors: Neighbors;
    }
}

export type ResolvedPath = ResolvedPath.CustomMarkdownPage | ResolvedPath.ApiPage;
