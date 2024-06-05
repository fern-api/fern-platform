import { useContext } from "react";
import { LayoutBreakpoint, type LayoutBreakpointValue } from "./LayoutBreakpoint.js";

export function useLayoutBreakpoint(): LayoutBreakpointValue {
    return useContext(LayoutBreakpoint);
}
