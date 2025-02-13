"use client";

import { ReactNode, createElement, useRef } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { ErrorBoundary } from "@/components/error-boundary";
import { Markdown } from "@/components/mdx/Markdown";

import { FernAnchor } from "../../components/FernAnchor";
import { useHref } from "../../hooks/useHref";
import { getAnchorId } from "../../util/anchor";

export declare namespace EndpointSection {
  export type Props = React.PropsWithChildren<{
    headerType?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    title: ReactNode;
    description?: string | undefined;
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
    <ErrorBoundary>
      <div ref={ref} id={href}>
        <FernAnchor href={href}>
          {createElement(
            headerType,
            { className: "relative mt-0 flex items-center mb-3" },
            title
          )}
        </FernAnchor>
        <Markdown className="mb-2 text-base" mdx={description} />
        {children}
      </div>
    </ErrorBoundary>
  );
};
