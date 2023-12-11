import { useContext } from "react";
import { NavigationContext, type NavigationContextValue } from "./NavigationContext";

export function useNavigationContext(): NavigationContextValue {
    return useContext(NavigationContext);
}

export function useShouldHideFromSsg(slug: string): boolean {
    const { resolvedPath, hydrated } = useNavigationContext();
    return resolvedPath.fullSlug !== slug && !hydrated;
}
