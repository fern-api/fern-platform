import { useContext } from "react";
import { LayoutBreakpoint, type LayoutBreakpointValue } from "./LayoutBreakpoint";

export function useLayoutBreakpoint(): LayoutBreakpointValue {
    return useContext(LayoutBreakpoint);
}
