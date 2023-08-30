import { useContext } from "react";
import { MobileSidebarContext, type MobileSidebarContextValue } from "./MobileSidebarContext";

export function useMobileSidebarContext(): MobileSidebarContextValue {
    return useContext(MobileSidebarContext)();
}
