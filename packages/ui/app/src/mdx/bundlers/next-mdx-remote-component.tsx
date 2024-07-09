import { MDXRemote } from "next-mdx-remote";
import { ReactElement } from "react";
import { HTML_COMPONENTS, JSX_COMPONENTS } from "../mdx-components";
import type { BundledMDX } from "../types";

export const NextMdxRemoteComponent = ({ code, frontmatter }: Exclude<BundledMDX, string>): ReactElement => {
    const COMPONENTS = { ...HTML_COMPONENTS, ...JSX_COMPONENTS };
    return <MDXRemote scope={{}} frontmatter={frontmatter} compiledSource={code} components={COMPONENTS} />;
};
