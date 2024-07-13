import { useContext } from "react";
import { NavigationContext, type NavigationContextValue } from "./NavigationContext";

export function useNavigationContext(): NavigationContextValue {
    return useContext(NavigationContext);
}
