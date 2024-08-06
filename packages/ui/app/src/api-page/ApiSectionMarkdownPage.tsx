import clsx from "clsx";
import { ReactElement, memo } from "react";
import { useShouldLazyRender } from "../hooks/useShouldLazyRender";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPageMetadata } from "../resolver/types";
import { useApiPageCenterElement } from "./useApiPageCenterElement";

export const ApiSectionMarkdownPage = memo(
    ({
        page,
        hideBottomSeparator,
    }: {
        page: ResolvedPageMetadata;
        hideBottomSeparator: boolean;
    }): ReactElement | null => {
        const slug = page.slug;

        const ref = useApiPageCenterElement({ slug });

        // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
        // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
        // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
        if (useShouldLazyRender(slug)) {
            return null;
        }

        return (
            <div
                className={clsx("scroll-mt-content", {
                    "border-default border-b mb-px": !hideBottomSeparator,
                })}
                ref={ref}
                id={`/${slug}`}
            >
                <MdxContent mdx={page.markdown} />
            </div>
        );
    },
);

ApiSectionMarkdownPage.displayName = "ApiSectionMarkdownPage";
