import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { createMdxComponents } from "../components";

export const MdxBundlerComponent = ({
  code,
  scope,
  frontmatter,
  jsxRefs,
}: Exclude<FernDocs.MarkdownText, string>): ReactElement => {
  const Component = useMemo(
    () =>
      getMDXComponent(code, {
        // Note: do not override `props` from scope
        ...scope,

        // allows us to use MDXProvider to pass components to children
        MdxJsReact: {
          useMDXComponents,
        },

        // allows us to use frontmatter in the MDX
        frontmatter,
      }),
    [code, scope, frontmatter]
  );
  return (
    <MDXProvider components={createMdxComponents(jsxRefs ?? [])}>
      <Component />
    </MDXProvider>
  );
};
