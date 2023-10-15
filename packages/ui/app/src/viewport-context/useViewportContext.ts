import { useContext } from "react";
import { ViewportContext, type ViewportContextValue } from "./ViewportContext";

export function useViewportContext(): ViewportContextValue {
    return useContext(ViewportContext);
}
