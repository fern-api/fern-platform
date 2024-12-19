import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type { FernSerializeMdxOptions } from "./types";

export type MDX_SERIALIZER = {
    (
        content: string,
        options?: FernSerializeMdxOptions
    ): Promise<FernDocs.MarkdownText>;
    (
        content: string | undefined,
        options?: FernSerializeMdxOptions
    ): Promise<FernDocs.MarkdownText | undefined>;
};
