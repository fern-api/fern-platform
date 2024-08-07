import { FernNavigation } from "@fern-api/fdr-sdk";
import { useEffect } from "react";
import { useIsReady, useIsSelectedSlug } from "../atoms";
import { scrollToRoute } from "../util/anchor";
import { slugToHref } from "../util/slugToHref";
export function useShouldLazyRender(slug: FernNavigation.Slug): boolean {
    const isSelectedSlug = useIsSelectedSlug(slug);
    const hydrated = useIsReady();

    useEffect(() => {
        if (isSelectedSlug && hydrated) {
            scrollToRoute(slugToHref(slug));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated]);

    return !isSelectedSlug && !hydrated;
}
