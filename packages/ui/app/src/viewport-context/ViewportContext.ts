import { createContext } from "react";

export const ViewportContext = createContext<ViewportContextValue>({
    layoutBreakpoint: "lg",
    viewportSize: {
        width: 0,
        height: 0,
    },
});

export interface ViewportContextValue {
    layoutBreakpoint: "sm" | "md" | "lg";
    viewportSize: { width: number; height: number };
}
