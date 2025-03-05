"use client";

import React from "react";

import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { getMDXExport } from "mdx-bundler/client";

import { ErrorBoundary } from "@/components/error-boundary";

import { createMdxComponents } from "../components";

export const MdxComponent = React.memo<{
  code: string;
  jsxElements: string[];
}>(
  function MdxComponent({ code, jsxElements }) {
    const { default: Component } = getMDXExport(code, {
      // allows us to use MDXProvider to pass components to children
      MdxJsReact: { useMDXComponents },
    });
    return (
      <ErrorBoundary>
        <MDXProvider components={createMdxComponents(jsxElements)}>
          <Component />
        </MDXProvider>
      </ErrorBoundary>
    );
  },
  (prev, next) => prev.code === next.code
);

export const MdxAside = React.memo<{
  code: string;
  jsxElements: string[];
}>(
  function MdxAside({ code, jsxElements }) {
    const { Aside } =
      getMDXExport(code, {
        // allows us to use MDXProvider to pass components to children
        MdxJsReact: { useMDXComponents },
      }) ?? {};
    if (Aside == null) {
      return null;
    }
    return (
      <ErrorBoundary>
        <MDXProvider components={createMdxComponents(jsxElements)}>
          <div>
            <Aside />
          </div>
        </MDXProvider>
      </ErrorBoundary>
    );
  },
  (prev, next) => prev.code === next.code
);

export const MdxAsideComponent = React.memo<{
  code: string;
  jsxElements: string[];
}>(
  function MdxAsideComponent({ code, jsxElements }) {
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
        <MDXProvider components={createMdxComponents(jsxElements)}>
          {aside}
        </MDXProvider>
      </ErrorBoundary>
    );
  },
  (prev, next) => prev.code === next.code
);
