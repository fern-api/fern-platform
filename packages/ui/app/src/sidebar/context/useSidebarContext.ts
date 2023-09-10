import { useContext } from "react";
import { SidebarContext, type SidebarContextValue } from "./SidebarContext";

export function useSidebarContext(): SidebarContextValue {
    return useContext(SidebarContext)();
}
