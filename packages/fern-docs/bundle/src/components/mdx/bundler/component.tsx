"use client";

import React from "react";

import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { isEqual } from "es-toolkit/predicate";
import { getMDXComponent } from "mdx-bundler/client";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";

import { FrontmatterContextProvider } from "@/components/contexts/frontmatter";

import { createMdxComponents } from "../components";

export const MdxComponent = React.memo<FernDocs.ResolvedMdx>(
  function MdxComponent({ code, frontmatter, jsxRefs }) {
    const Component = getMDXComponent(code, {
      // allows us to use MDXProvider to pass components to children
      MdxJsReact: { useMDXComponents },
    });
    return (
      <FrontmatterContextProvider value={frontmatter}>
        <MDXProvider components={createMdxComponents(jsxRefs ?? [])}>
          <Component />
        </MDXProvider>
      </FrontmatterContextProvider>
    );
  },
  (prev, next) =>
    prev.code === next.code &&
    isEqual(prev.frontmatter, next.frontmatter) &&
    isEqual(prev.scope, next.scope)
);
