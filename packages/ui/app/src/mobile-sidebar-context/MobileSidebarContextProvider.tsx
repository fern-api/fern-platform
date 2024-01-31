import { useBooleanState } from "@fern-ui/react-commons";
import { PropsWithChildren, useCallback } from "react";
import { MobileSidebarContext, MobileSidebarContextValue } from "./MobileSidebarContext";

export declare namespace MobileSidebarContextProvider {
    export type Props = PropsWithChildren<{
        // ...
    }>;
}

export const MobileSidebarContextProvider: React.FC<MobileSidebarContextProvider.Props> = ({ children }) => {
    const {
        value: isMobileSidebarOpen,
        setTrue: openMobileSidebar,
        setFalse: closeMobileSidebar,
    } = useBooleanState(false);

    const contextValue = useCallback(
        (): MobileSidebarContextValue => ({
            isMobileSidebarOpen,
            openMobileSidebar,
            closeMobileSidebar,
        }),
        [isMobileSidebarOpen, openMobileSidebar, closeMobileSidebar],
    );

    return <MobileSidebarContext.Provider value={contextValue}>{children}</MobileSidebarContext.Provider>;
};
