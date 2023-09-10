import React from "react";

export const SidebarContext = React.createContext<() => SidebarContextValue>(() => {
    throw new Error("SidebarContext.Provider not found in tree");
});

export interface SidebarContextValue {
    expandAllSections: boolean;
    /** Will be 0 if the config is not tabbed. */
    activeTabIndex: number;
    setActiveTabIndex: (index: number) => void;
}
