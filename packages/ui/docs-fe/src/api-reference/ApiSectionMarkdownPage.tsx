import clsx from "clsx";
import { ReactElement, memo, useRef } from "react";
import { useHref } from "../hooks/useHref";
import { useShouldLazyRender } from "../hooks/useShouldLazyRender";
import { Markdown } from "../mdx/Markdown";
import { ResolvedPageMetadata } from "../resolver/types";
import { useApiPageCenterElement } from "./useApiPageCenterElement";

interface ApiSectionMarkdownPageProps {
    page: ResolvedPageMetadata;
    hideBottomSeparator: boolean;
}

const ApiSectionMarkdownContent = ({ page, hideBottomSeparator }: ApiSectionMarkdownPageProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, page.slug);

    return (
        <div
            className={clsx("scroll-mt-content", {
                "border-default border-b mb-px": !hideBottomSeparator,
            })}
            ref={ref}
            id={useHref(page.slug)}
        >
            <Markdown mdx={page.markdown} />
        </div>
    );
};

export const ApiSectionMarkdownPage = memo(
    ({
        page,
        hideBottomSeparator,
    }: {
        page: ResolvedPageMetadata;
        hideBottomSeparator: boolean;
    }): ReactElement | null => {
        // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
        // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
        // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
        if (useShouldLazyRender(page.slug)) {
            return null;
        }

        return <ApiSectionMarkdownContent page={page} hideBottomSeparator={hideBottomSeparator} />;
    },
);

ApiSectionMarkdownPage.displayName = "ApiSectionMarkdownPage";
