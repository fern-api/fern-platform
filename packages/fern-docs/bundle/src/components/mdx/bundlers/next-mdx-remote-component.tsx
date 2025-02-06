import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { MDXRemote } from "next-mdx-remote";
import { ReactElement } from "react";
import { createMdxComponents } from "../components";

export const NextMdxRemoteComponent = ({
  scope,
  code,
  frontmatter,
  jsxRefs,
}: Exclude<FernDocs.MarkdownText, string>): ReactElement => {
  return (
    <MDXRemote
      scope={scope}
      frontmatter={frontmatter}
      compiledSource={code}
      components={createMdxComponents(jsxRefs ?? [])}
    />
  );
};
