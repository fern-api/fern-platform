import { DocsV1Read } from "@fern-api/fdr-sdk";
import { TableOfContentsItem, type SerializedMdxContent } from "./mdx";

export declare namespace ResolvedPath {
    interface CustomMarkdownPage {
        type: "custom-markdown-page";
        fullSlug: string;
        page: DocsV1Read.PageMetadata;
        sectionTitle: string | null;
        tableOfContents: TableOfContentsItem[];
        serializedMdxContent: SerializedMdxContent;
        editThisPageUrl: string | undefined;
    }

    interface ApiPage {
        type: "api-page";
        fullSlug: string;
        apiSection: DocsV1Read.ApiSection;
    }
}

export type ResolvedPath = ResolvedPath.CustomMarkdownPage | ResolvedPath.ApiPage;
