import { useFeatureFlags, useIsReady, useIsSelectedSlug } from "@/atoms";
import { FernNavigation } from "@fern-api/fdr-sdk";

export function useShouldLazyRender(slug: FernNavigation.Slug): boolean {
    const { isApiScrollingDisabled } = useFeatureFlags();
    const isSelectedSlug = useIsSelectedSlug(slug);
    const hydrated = useIsReady();
    return !isSelectedSlug && (!hydrated || isApiScrollingDisabled);
}
