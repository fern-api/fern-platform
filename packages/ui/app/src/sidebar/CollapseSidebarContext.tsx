import { useBooleanState } from "@fern-ui/react-commons";
import { noop } from "lodash-es";
import { createContext, FC, PropsWithChildren, useContext } from "react";

const CollapseSidebarContext = createContext<useBooleanState.Return>({
    value: true,
    setTrue: noop,
    setFalse: noop,
    toggleValue: noop,
    setValue: noop,
});

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCollapseSidebar = () => useContext(CollapseSidebarContext);

export const CollapseSidebarProvider: FC<PropsWithChildren> = ({ children }) => {
    const isCollapsed = useBooleanState(true);
    return <CollapseSidebarContext.Provider value={isCollapsed}>{children}</CollapseSidebarContext.Provider>;
};
