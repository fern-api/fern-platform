import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { Separator } from "@radix-ui/react-separator";
import dynamic from "next/dynamic";
import { ReactNode, createElement, useRef } from "react";
import { FernAnchor } from "../../components/FernAnchor";
import { FernErrorBoundary } from "../../components/FernErrorBoundary";
import { useHref } from "../../hooks/useHref";
import { getAnchorId } from "../../util/anchor";

const Markdown = dynamic(
  () => import("../../mdx/Markdown").then(({ Markdown }) => Markdown),
  {
    ssr: true,
  }
);

export declare namespace EndpointSection {
  export type Props = React.PropsWithChildren<{
    headerType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    title: ReactNode;
    description?: FernDocs.MarkdownText | undefined;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
  }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({
  headerType = "h3",
  title,
  description,
  anchorIdParts,
  slug,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const anchorId = getAnchorId(anchorIdParts);
  const href = useHref(slug, anchorId);
  return (
    <FernErrorBoundary component="EndpointSection">
      <div ref={ref} id={href} className="scroll-mt-content">
        <FernAnchor href={href}>
          {createElement(
            headerType,
            { className: "relative mt-0 flex items-center mb-3" },
            title
          )}
        </FernAnchor>
        <Markdown className="mb-2 text-base" mdx={description} />
        <Separator
          orientation="horizontal"
          className="bg-border-default h-px"
        />
        {children}
      </div>
    </FernErrorBoundary>
  );
};
