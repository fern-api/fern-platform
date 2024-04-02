import { createContext } from "react";

export const ViewportContext = createContext<ViewportContextValue>({
    layoutBreakpoint: "lg",
    // viewportSize: {
    //     width: 0,
    //     height: 0,
    // },
});

export interface ViewportContextValue {
    layoutBreakpoint: "mobile" | "sm" | "md" | "lg" | "xl" | "2xl";
    // viewportSize: { width: number; height: number };
}
