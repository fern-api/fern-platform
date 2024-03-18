import { useContext } from "react";
import { useFeatureFlags } from "../FeatureFlagContext";
import { useIsReady } from "../useIsReady";
import { NavigationContext, type NavigationContextValue } from "./NavigationContext";

export function useNavigationContext(): NavigationContextValue {
    return useContext(NavigationContext);
}

export function useShouldHideFromSsg(slug: string): boolean {
    const { isApiScrollingDisabled } = useFeatureFlags();
    const { selectedSlug } = useNavigationContext();
    const hydrated = useIsReady();
    return selectedSlug !== slug && (!hydrated || isApiScrollingDisabled);
}
