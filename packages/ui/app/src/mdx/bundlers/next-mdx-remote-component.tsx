import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { MDXRemote } from "next-mdx-remote";
import { ReactElement } from "react";
import { createMdxComponents } from "../components";

export const NextMdxRemoteComponent = ({
    code,
    frontmatter,
    jsxElements,
}: Exclude<FernDocs.MarkdownText, string> & { jsxElements?: string[] }): ReactElement => {
    return (
        <MDXRemote
            scope={{}}
            frontmatter={frontmatter}
            compiledSource={code}
            components={createMdxComponents(jsxElements ?? [])}
        />
    );
};
