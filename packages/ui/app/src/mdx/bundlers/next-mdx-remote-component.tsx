import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { MDXRemote } from "next-mdx-remote";
import { ReactElement } from "react";
import { MDX_COMPONENTS } from "../components";

export const NextMdxRemoteComponent = ({
    code,
    frontmatter,
}: Exclude<ApiDefinition.BundledMdx, string>): ReactElement => {
    return <MDXRemote scope={{}} frontmatter={frontmatter} compiledSource={code} components={MDX_COMPONENTS} />;
};
