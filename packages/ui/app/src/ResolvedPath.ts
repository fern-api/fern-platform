import { type SerializedMdxContent } from "@fern-ui/app-utils";

export declare namespace ResolvedPath {
    interface MdxPage {
        type: "mdx-page";
        fullSlug: string;
        serializedMdxContent: SerializedMdxContent;
    }

    interface Other {
        fullSlug: string;
        type: "other";
    }
}

export type ResolvedPath = ResolvedPath.MdxPage | ResolvedPath.Other;
