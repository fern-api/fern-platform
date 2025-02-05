"use client";

import SetLayoutAtom from "@/state/set-layout-atom";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { getMDXComponent } from "mdx-bundler/client";
import { ReactElement, useMemo } from "react";
import { createMdxComponents } from "../components";

export const MdxBundlerComponent = ({
  code,
  scope,
  frontmatter,
  jsxRefs,
  dangerouslyForceHydrate = false,
}: Exclude<FernDocs.MarkdownText, string> & {
  dangerouslyForceHydrate?: boolean;
}): ReactElement => {
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
      <SetLayoutAtom
        layout={frontmatter.layout ?? "guide"}
        dangerouslyForceHydrate={dangerouslyForceHydrate}
      />
      <Component />
    </MDXProvider>
  );
};
