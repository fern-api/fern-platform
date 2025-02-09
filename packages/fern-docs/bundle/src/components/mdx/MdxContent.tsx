"use client";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import React, { memo } from "react";
import { FernErrorBoundary } from "../components/FernErrorBoundary";
import { FrontmatterContextProvider } from "../contexts/frontmatter";
import { MdxBundlerComponent } from "./bundlers/mdx-bundler-component";

type MarkdownText = string | FernDocs.ResolvedMdx;

export declare namespace MdxContent {
  export interface Props {
    mdx: MarkdownText | MarkdownText[] | undefined;
    fallback?: React.ReactNode;
  }
}

function isMdxEmpty(mdx: MarkdownText | MarkdownText[] | undefined): boolean {
  if (!mdx) {
    return true;
  }

  if (typeof mdx === "string") {
    return mdx.trim().length === 0;
  }

  if (Array.isArray(mdx)) {
    return mdx.length === 0 || mdx.every(isMdxEmpty);
  }

  return mdx.code.trim().length === 0;
}

export const MdxContent = memo<MdxContent.Props>(function MdxContent({
  mdx,
  fallback,
}) {
  if (isMdxEmpty(mdx) || mdx == null) {
    return fallback;
  }

  if (typeof mdx === "string") {
    return mdx;
  }

  if (Array.isArray(mdx)) {
    return (
      <>
        {mdx.map((mdx, index) => (
          <MdxContent key={index} mdx={mdx} />
        ))}
      </>
    );
  }

  return (
    <FernErrorBoundary component="MdxContent">
      <FrontmatterContextProvider value={mdx.frontmatter}>
        <MdxBundlerComponent {...mdx} />
      </FrontmatterContextProvider>
    </FernErrorBoundary>
  );
});
