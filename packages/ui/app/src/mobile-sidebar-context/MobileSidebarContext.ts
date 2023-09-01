import { createContext } from "react";

export const MobileSidebarContext = createContext<() => MobileSidebarContextValue>(() => {
    throw new Error("MobileSidebarContextValueProvider is not present in this tree.");
});

export interface MobileSidebarContextValue {
    isMobileSidebarOpen: boolean;
    openMobileSidebar: () => void;
    closeMobileSidebar: () => void;
}
