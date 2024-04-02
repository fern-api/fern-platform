import { createContext } from "react";

export const LayoutBreakpoint = createContext<LayoutBreakpointValue>("lg");

export type LayoutBreakpointValue = "mobile" | "sm" | "md" | "lg" | "xl" | "2xl";
