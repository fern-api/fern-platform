import { MDXRemote } from "next-mdx-remote";
import { ReactElement } from "react";
import { MDX_COMPONENTS } from "../components";
import type { BundledMDX } from "../types";

export const NextMdxRemoteComponent = ({ code, frontmatter }: Exclude<BundledMDX, string>): ReactElement => {
    return <MDXRemote scope={{}} frontmatter={frontmatter} compiledSource={code} components={MDX_COMPONENTS} />;
};
