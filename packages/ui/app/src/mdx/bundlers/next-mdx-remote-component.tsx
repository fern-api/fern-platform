import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { MDXRemote } from "next-mdx-remote";
import { ReactElement } from "react";
import { MDX_COMPONENTS } from "../components";

export const NextMdxRemoteComponent = ({ code, frontmatter }: Exclude<FernDocs.MarkdownText, string>): ReactElement => {
    return <MDXRemote scope={{}} frontmatter={frontmatter} compiledSource={code} components={MDX_COMPONENTS} />;
};
