import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import clsx from "clsx";
import { ReactElement, memo, useRef } from "react";
import { useHref } from "../hooks/useHref";
import { LayoutEvaluator } from "../layouts/LayoutEvaluator";
import { DocsContent } from "../resolver/DocsContent";
import { useApiPageCenterElement } from "./useApiPageCenterElement";

interface ApiSectionMarkdownContentProps {
  node: FernNavigation.NavigationNodeWithMarkdown;
  mdx: Omit<DocsContent.MarkdownPage, "type" | "apis">;
  last?: boolean;
}

function ApiSectionMarkdownContent({
  node,
  mdx,
  last = false,
}: ApiSectionMarkdownContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  useApiPageCenterElement(ref, node.slug);

  return (
    <div
      className={clsx("scroll-mt-content")}
      ref={ref}
      id={useHref(node.slug)}
    >
      <LayoutEvaluator {...mdx} />

      {/* TODO: the following ensures that the bottom line matches the rest of the api reference, but this isn't very graceful */}
      <div className="fern-endpoint-content">
        <div className={clsx({ "border-default mb-px border-b": !last })} />
      </div>
    </div>
  );
}

interface ApiSectionMarkdownPageProps {
  node: FernNavigation.NavigationNodeWithMarkdown;
  mdxs: Record<string, Omit<DocsContent.MarkdownPage, "type" | "apis">>;
  last?: boolean;
}

export const ApiSectionMarkdownPage = memo(
  ({ node, mdxs, last }: ApiSectionMarkdownPageProps): ReactElement<any> | null => {
    const mdx = mdxs[node.id];

    if (!mdx) {
      // TODO: sentry

      console.error(`No markdown content found for node ${node.id}`);
      return null;
    }

    return <ApiSectionMarkdownContent node={node} mdx={mdx} last={last} />;
  }
);

ApiSectionMarkdownPage.displayName = "ApiSectionMarkdownPage";
