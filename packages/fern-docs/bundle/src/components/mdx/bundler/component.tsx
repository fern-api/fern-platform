"use client";

import React from "react";

import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { getMDXComponent } from "mdx-bundler/client";

import { createMdxComponents } from "../components";

export const MdxComponent = React.memo<{ code: string }>(
  function MdxComponent({ code }) {
    const Component = getMDXComponent(code, {
      // allows us to use MDXProvider to pass components to children
      MdxJsReact: { useMDXComponents },
    });
    return (
      <MDXProvider components={createMdxComponents([])}>
        <Component />
      </MDXProvider>
    );
  },
  (prev, next) => prev.code === next.code
);
