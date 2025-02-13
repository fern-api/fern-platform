"use client";

import React from "react";

import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { getMDXComponent, getMDXExport } from "mdx-bundler/client";

import { ErrorBoundary } from "@/components/error-boundary";

import { createMdxComponents } from "../components";

export const MdxComponent = React.memo<{ code: string }>(
  function MdxComponent({ code }) {
    const Component = getMDXComponent(code, {
      // allows us to use MDXProvider to pass components to children
      MdxJsReact: { useMDXComponents },
    });
    return (
      <ErrorBoundary>
        <MDXProvider components={createMdxComponents([])}>
          <Component />
        </MDXProvider>
      </ErrorBoundary>
    );
  },
  (prev, next) => prev.code === next.code
);

export const MdxAsideComponent = React.memo<{ code: string }>(
  function MdxAsideComponent({ code }) {
    const { aside } =
      getMDXExport(code, {
        // allows us to use MDXProvider to pass components to children
        MdxJsReact: { useMDXComponents },
      }) ?? {};
    if (aside == null) {
      return null;
    }
    return (
      <ErrorBoundary>
        <MDXProvider components={createMdxComponents([])}>{aside}</MDXProvider>
      </ErrorBoundary>
    );
  }
);
