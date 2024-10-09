import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import clsx from "clsx";
import { ReactElement, memo, useRef } from "react";
import { useHref } from "../hooks/useHref";
import { useShouldLazyRender } from "../hooks/useShouldLazyRender";
import { Markdown } from "../mdx/Markdown";
import { useApiPageCenterElement } from "./useApiPageCenterElement";

interface ApiSectionMarkdownPageProps {
    node: FernNavigation.NavigationNodeWithMarkdown;
    mdx: FernDocs.MarkdownText;
    hideBottomSeparator: boolean;
}

const ApiSectionMarkdownContent = ({ node, mdx, hideBottomSeparator }: ApiSectionMarkdownPageProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, node.slug);

    return (
        <div
            className={clsx("scroll-mt-content", {
                "border-default border-b mb-px": !hideBottomSeparator,
            })}
            ref={ref}
            id={useHref(node.slug)}
        >
            <Markdown mdx={mdx} />
        </div>
    );
};

export const ApiSectionMarkdownPage = memo(
    ({
        node,
        mdxs,
        hideBottomSeparator,
    }: {
        node: FernNavigation.NavigationNodeWithMarkdown;
        mdxs: Record<string, FernDocs.MarkdownText>;
        hideBottomSeparator: boolean;
    }): ReactElement | null => {
        // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
        // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
        // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
        if (useShouldLazyRender(node.slug)) {
            return null;
        }

        const mdx = mdxs[node.id];

        if (!mdx) {
            // TODO: sentry
            // eslint-disable-next-line no-console
            console.error(`No markdown content found for node ${node.id}`);
            return null;
        }

        return <ApiSectionMarkdownContent node={node} mdx={mdx} hideBottomSeparator={hideBottomSeparator} />;
    },
);

ApiSectionMarkdownPage.displayName = "ApiSectionMarkdownPage";
