import { type SerializedMdxContent } from "@fern-ui/app-utils";

interface ResolvedPathMdxPage {
    type: "mdx-page";
    fullSlug: string;
    serializedMdxContent: SerializedMdxContent;
}

interface ResolvedPathOther {
    fullSlug: string;
    type: "other";
}

export type ResolvedPath = ResolvedPathMdxPage | ResolvedPathOther;
