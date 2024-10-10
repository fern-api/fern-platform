import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import clsx from "clsx";
import { ReactElement, memo, useRef } from "react";
import { useHref } from "../hooks/useHref";
import { Markdown } from "../mdx/Markdown";
import { useApiPageCenterElement } from "./useApiPageCenterElement";

interface ApiSectionMarkdownContentProps {
    node: FernNavigation.NavigationNodeWithMarkdown;
    mdx: FernDocs.MarkdownText;
    last?: boolean;
}

function ApiSectionMarkdownContent({ node, mdx, last = false }: ApiSectionMarkdownContentProps) {
    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, node.slug);

    return (
        <div className={clsx("scroll-mt-content")} ref={ref} id={useHref(node.slug)}>
            <Markdown mdx={mdx} />

            {/* TODO: the following ensures that the bottom line matches the rest of the api reference, but this isn't very graceful */}
            <div className="fern-endpoint-content">
                <div className={clsx({ "border-default border-b mb-px": !last })} />
            </div>
        </div>
    );
}

interface ApiSectionMarkdownPageProps {
    node: FernNavigation.NavigationNodeWithMarkdown;
    mdxs: Record<string, FernDocs.MarkdownText>;
    last?: boolean;
}

export const ApiSectionMarkdownPage = memo(({ node, mdxs, last }: ApiSectionMarkdownPageProps): ReactElement | null => {
    const mdx = mdxs[node.id];

    if (!mdx) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error(`No markdown content found for node ${node.id}`);
        return null;
    }

    return <ApiSectionMarkdownContent node={node} mdx={mdx} last={last} />;
});

ApiSectionMarkdownPage.displayName = "ApiSectionMarkdownPage";
