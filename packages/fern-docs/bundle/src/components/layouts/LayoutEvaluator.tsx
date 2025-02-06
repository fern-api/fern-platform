"use server";

import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { EMPTY_FRONTMATTER } from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isToc, TableOfContentsItem } from "@fern-docs/mdx";
import { getMDXExport } from "mdx-bundler/client";
import { serializeMdx } from "../mdx/bundlers/mdx-bundler";
import { MdxContent } from "../mdx/MdxContent";
import { LayoutEvaluatorContent } from "./LayoutEvaluatorContent";

export interface LayoutEvaluatorProps {
  fallbackTitle: string;
  mdx: FernDocs.MarkdownText;
  breadcrumb: readonly FernNavigation.BreadcrumbItem[];
  hasAside: boolean;
}

export async function LayoutEvaluator({
  fallbackTitle,
  mdx,
  breadcrumb,
  hasAside,
}: LayoutEvaluatorProps) {
  const exports =
    typeof mdx !== "string"
      ? getMDXExport(mdx.code, {
          // allows us to use MDXProvider to pass components to children
          MdxJsReact: {
            useMDXComponents: () => ({}),
          },
        })
      : undefined;
  const toc = asToc(exports?.toc);
  const frontmatter: FernDocs.Frontmatter =
    typeof mdx === "string" ? EMPTY_FRONTMATTER : mdx.frontmatter;

  const [title, subtitle] = await Promise.all([
    serializeMdx(frontmatter.title ?? fallbackTitle),
    serializeMdx(frontmatter.subtitle),
  ]);

  return (
    <LayoutEvaluatorContent
      title={<MdxContent mdx={title} />}
      subtitle={subtitle ? <MdxContent mdx={subtitle} /> : undefined}
      frontmatter={frontmatter}
      breadcrumb={breadcrumb}
      tableOfContents={toc}
      hasAside={hasAside}
    >
      <MdxContent mdx={mdx} />
    </LayoutEvaluatorContent>
  );
}

function asToc(unknown: unknown): TableOfContentsItem[] {
  if (isToc(unknown)) {
    return unknown;
  }
  return [];
}
