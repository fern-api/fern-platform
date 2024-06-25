import { createContext } from "react";

export const BREAKPOINTS = [
    "mobile" as const,
    "sm" as const,
    "md" as const,
    "lg" as const,
    "xl" as const,
    "2xl" as const,
];

export type Breakpoint = (typeof BREAKPOINTS)[number];

export interface LayoutBreakpointValue {
    value: Breakpoint;
    max: (bp: Breakpoint) => boolean;
    min: (bp: Breakpoint) => boolean;
}

export const LayoutBreakpoint = createContext<LayoutBreakpointValue>({
    value: "lg",
    max: () => false,
    min: () => false,
});
