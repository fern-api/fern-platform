import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { createMdxComponents } from "../components";

export const MdxBundlerComponent = ({
  code,
  jsxRefs,
}: Exclude<FernDocs.MarkdownText, string>): ReactElement => {
  const Component = useMemo(
    () =>
      getMDXComponent(code, {
        // allows us to use MDXProvider to pass components to children
        MdxJsReact: {
          useMDXComponents,
        },
      }),
    [code]
  );
  return (
    <MDXProvider components={createMdxComponents(jsxRefs ?? [])}>
      <Component />
    </MDXProvider>
  );
};
