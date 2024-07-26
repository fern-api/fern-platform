import { FernNavigation } from "@fern-api/fdr-sdk";
import { useIsReady, useIsSelectedSlug } from "../atoms";

export function useShouldLazyRender(slug: FernNavigation.Slug): boolean {
    const isSelectedSlug = useIsSelectedSlug(slug);
    const hydrated = useIsReady();
    return !isSelectedSlug && !hydrated;
}
