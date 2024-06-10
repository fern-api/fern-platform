import clsx from "clsx";
import { ReactElement } from "react";
import { useShouldHideFromSsg } from "../contexts/navigation-context/useNavigationContext";
import { MdxContent } from "../mdx/MdxContent";
import { ResolvedPageMetadata } from "../resolver/types";
import { useApiPageCenterElement } from "./useApiPageCenterElement";

export const ApiSectionMarkdownPage = ({
    page,
    hideBottomSeparator,
}: {
    page: ResolvedPageMetadata;
    hideBottomSeparator: boolean;
}): ReactElement | null => {
    const slug = page.slug;

    const { setTargetRef } = useApiPageCenterElement({ slug });

    // TODO: this is a temporary fix to only SSG the content that is requested by the requested route.
    // - webcrawlers will accurately determine the canonical URL (right now every page "returns" the same full-length content)
    // - this allows us to render the static page before hydrating, preventing layout-shift caused by the navigation context.
    if (useShouldHideFromSsg(slug)) {
        return null;
    }

    return (
        <div
            className={clsx("scroll-mt-header-height-padded", {
                "border-default border-b mb-px": !hideBottomSeparator,
            })}
            ref={setTargetRef}
            data-route={`/${slug}`}
        >
            <MdxContent mdx={page.markdown} />
        </div>
    );
};
