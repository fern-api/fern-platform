import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import clsx from "clsx";
import { memo, type ReactNode } from "react";
import { isMdxEmpty, MdxContent } from "./MdxContent";

export declare namespace Markdown {
  export interface Props {
    title?: ReactNode;

    // mdx: FernDocs.MarkdownText | FernDocs.MarkdownText[] | undefined;
    mdx: FernDocs.MarkdownText | undefined;
    className?: string;
    size?: "xs" | "sm" | "lg";

    /**
     * Fallback content to render if the MDX is empty
     */
    fallback?: ReactNode;

    fallbackAsChild?: boolean;
  }
}

export const Markdown = memo<Markdown.Props>(
  ({ title, mdx, className, size, fallback, fallbackAsChild }) => {
    // If the MDX is empty, return null
    if (!fallback && isMdxEmpty(mdx)) {
      return false;
    }

    if (fallbackAsChild) {
      return fallback;
    }

    return (
      <div
        className={clsx(
          className,
          "prose dark:prose-invert max-w-none break-words",
          {
            "whitespace-pre-wrap": typeof mdx === "string",
            "prose-base": size == null,
            "prose-sm dark:prose-invert-sm !text-xs": size === "xs",
            "prose-sm dark:prose-invert-sm": size === "sm",
            "prose-lg": size === "lg",
          }
        )}
      >
        {title}
        <MdxContent mdx={mdx} fallback={fallback} />
      </div>
    );
  }
);

Markdown.displayName = "Markdown";
