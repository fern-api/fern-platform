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
        api: string;
        apiDefinition: ResolvedRootPackage;
        artifacts: DocsV1Read.ApiArtifacts | null;
        showErrors: boolean;
        neighbors: Neighbors;
        sectionUrlSlug: string;
        skipUrlSlug: boolean;
    }
}

export type ResolvedPath = ResolvedPath.CustomMarkdownPage | ResolvedPath.ApiPage;
