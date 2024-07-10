import { FernNavigation } from "@fern-api/fdr-sdk";
import { atom, useAtomValue } from "jotai";
import { useContext, useMemo } from "react";
import { useFeatureFlags } from "../../atoms/flags";
import { SLUG_ATOM } from "../../atoms/location";
import { useIsReady } from "../../atoms/viewport";
import { NavigationContext, type NavigationContextValue } from "./NavigationContext";

export function useNavigationContext(): NavigationContextValue {
    return useContext(NavigationContext);
}

export function useShouldHideFromSsg(slug: FernNavigation.Slug): boolean {
    const { isApiScrollingDisabled } = useFeatureFlags();
    const isSelectedSlug = useAtomValue(useMemo(() => atom((get) => get(SLUG_ATOM) === slug), [slug]));
    const hydrated = useIsReady();
    return !isSelectedSlug && (!hydrated || isApiScrollingDisabled);
}
