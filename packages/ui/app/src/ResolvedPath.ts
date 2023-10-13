import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { type SerializedMdxContent } from "@fern-ui/app-utils";

export declare namespace ResolvedPath {
    interface CustomMarkdownPage {
        type: "custom-markdown-page";
        fullSlug: string;
        page: FernRegistryDocsRead.PageMetadata;
        serializedMdxContent: SerializedMdxContent;
    }

    interface ApiPage {
        type: "api-page";
        fullSlug: string;
        apiSection: FernRegistryDocsRead.ApiSection;
    }
}

export type ResolvedPath = ResolvedPath.CustomMarkdownPage | ResolvedPath.ApiPage;
