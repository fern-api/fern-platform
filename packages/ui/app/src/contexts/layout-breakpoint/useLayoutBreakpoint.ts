import { useContext } from "react";
import { Breakpoint, LayoutBreakpoint, LayoutBreakpointValue } from "./LayoutBreakpoint";

export function useLayoutBreakpointValue(): Breakpoint {
    return useContext(LayoutBreakpoint).value;
}

export function useLayoutBreakpoint(): LayoutBreakpointValue {
    return useContext(LayoutBreakpoint);
}
