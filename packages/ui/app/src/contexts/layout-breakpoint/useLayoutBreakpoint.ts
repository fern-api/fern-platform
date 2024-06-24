import { useContext } from "react";
import { Breakpoint, LayoutBreakpoint } from "./LayoutBreakpoint";

export function useLayoutBreakpointValue(): Breakpoint {
    return useContext(LayoutBreakpoint).value;
}

export function useLayoutBreakpoint() {
    return useContext(LayoutBreakpoint);
}
