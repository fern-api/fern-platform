import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import clsx from "clsx";
import { memo, type ReactNode } from "react";
import { MdxContent } from "./MdxContent";

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
    }
}

export const Markdown = memo<Markdown.Props>(
    ({ title, mdx, className, size, fallback }) => {
        // If the MDX is empty, return null
        if (
            !fallback &&
            (mdx == null ||
                (typeof mdx === "string"
                    ? mdx.trim().length === 0
                    : mdx.code.trim().length === 0))
        ) {
            return null;
        }

        return (
            <div
                className={clsx(
                    className,
                    "break-words max-w-none prose dark:prose-invert",
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
