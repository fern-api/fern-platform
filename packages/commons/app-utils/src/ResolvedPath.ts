import { DocsV1Read } from "@fern-api/fdr-sdk";
import { type SerializedMdxContent } from "./mdx";

export declare namespace ResolvedPath {
    interface CustomMarkdownPage {
        type: "custom-markdown-page";
        fullSlug: string;
        page: DocsV1Read.PageMetadata;
        sectionTitle: string | null;
        serializedMdxContent: SerializedMdxContent;
        editThisPageUrl: string | null;
    }

    interface ApiPage {
        type: "api-page";
        fullSlug: string;
        apiSection: DocsV1Read.ApiSection;
    }
}

export type ResolvedPath = ResolvedPath.CustomMarkdownPage | ResolvedPath.ApiPage;
