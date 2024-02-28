import { useContext } from "react";
import { NavigationContext, type NavigationContextValue } from "./NavigationContext";

export function useNavigationContext(): NavigationContextValue {
    return useContext(NavigationContext);
}

export function useShouldHideFromSsg(slug: string): boolean {
    const { selectedSlug, hydrated } = useNavigationContext();
    return selectedSlug !== slug && !hydrated;
}
