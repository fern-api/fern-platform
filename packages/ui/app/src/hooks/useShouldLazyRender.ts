import { FernNavigation } from "@fern-api/fdr-sdk";
import { useFeatureFlags } from "../atoms/flags";
import { useIsSelectedSlug } from "../atoms/location";
import { useIsReady } from "../atoms/viewport";

export function useShouldLazyRender(slug: FernNavigation.Slug): boolean {
    const { isApiScrollingDisabled } = useFeatureFlags();
    const isSelectedSlug = useIsSelectedSlug(slug);
    const hydrated = useIsReady();
    return !isSelectedSlug && (!hydrated || isApiScrollingDisabled);
}
