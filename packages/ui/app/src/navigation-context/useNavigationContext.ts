import { useBooleanState } from "@fern-ui/react-commons";
import { useContext, useEffect } from "react";
import { NavigationContext, type NavigationContextValue } from "./NavigationContext";

export function useNavigationContext(): NavigationContextValue {
    return useContext(NavigationContext);
}

export function useShouldHideFromSsg(slug: string): boolean {
    const { resolvedPath } = useNavigationContext();
    const isMounted = useBooleanState(false);
    useEffect(() => {
        isMounted.setTrue();
    }, [isMounted]);
    return resolvedPath.fullSlug !== slug && !isMounted.value;
}
