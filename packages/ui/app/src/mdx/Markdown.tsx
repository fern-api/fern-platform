import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import { cn } from "@fern-ui/components";
import { ComponentPropsWithoutRef, forwardRef, memo, type ReactNode } from "react";
import { MdxContent } from "./MdxContent";

export const Markdown = memo(
    forwardRef<
        HTMLDivElement,
        ComponentPropsWithoutRef<"div"> & {
            title?: ReactNode;

            // mdx: FernDocs.MarkdownText | FernDocs.MarkdownText[] | undefined;
            mdx: FernDocs.MarkdownText | undefined;
            size?: "xs" | "sm" | "lg";

            /**
             * Fallback content to render if the MDX is empty
             */
            fallback?: ReactNode;
        }
    >(({ title, mdx, size, fallback, ...props }, ref) => {
        // If the MDX is empty, return null
        if (
            !fallback &&
            (mdx == null || (typeof mdx === "string" ? mdx.trim().length === 0 : mdx.code.trim().length === 0))
        ) {
            return null;
        }

        return (
            <div
                {...props}
                ref={ref}
                className={cn(
                    "break-words max-w-none prose dark:prose-invert",
                    {
                        "whitespace-pre-wrap": typeof mdx === "string",
                        "prose-base": size == null,
                        "prose-sm dark:prose-invert-sm !text-xs": size === "xs",
                        "prose-sm dark:prose-invert-sm": size === "sm",
                        "prose-lg": size === "lg",
                    },
                    props.className,
                )}
            >
                {title}
                <MdxContent mdx={mdx} fallback={fallback} />
            </div>
        );
    }),
);

Markdown.displayName = "Markdown";
