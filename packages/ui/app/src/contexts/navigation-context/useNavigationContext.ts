import { useContext } from "react";
import { useFeatureFlags } from "../FeatureFlagContext";
import { NavigationContext, type NavigationContextValue } from "./NavigationContext";

export function useNavigationContext(): NavigationContextValue {
    return useContext(NavigationContext);
}

export function useShouldHideFromSsg(slug: string): boolean {
    const { isApiScrollingDisabled } = useFeatureFlags();
    const { selectedSlug, resolvedPath, hydrated } = useNavigationContext();
    return selectedSlug !== slug && (resolvedPath.type !== "api-page" || !hydrated || isApiScrollingDisabled);
}
