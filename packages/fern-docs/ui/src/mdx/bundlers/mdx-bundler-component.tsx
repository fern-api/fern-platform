import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { createMdxComponents } from "../components";

export const MdxBundlerComponent = ({
  code,
  scope,
  jsxRefs,
}: Exclude<FernDocs.MarkdownText, string>): ReactElement => {
  const Component = useMemo(
    () =>
      getMDXComponent(code, {
        ...scope,
        MdxJsReact: {
          useMDXComponents,
        },
      }),
    [code, scope]
  );
  return (
    <MDXProvider components={createMdxComponents(jsxRefs ?? [])}>
      <Component />
    </MDXProvider>
  );
};
