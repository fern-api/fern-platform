import classNames from "classnames";
import { PropsWithChildren, ReactElement, useContext, useMemo } from "react";
import { SidebarDepthContext, SidebarDepthContextValue } from "./context/SidebarDepthContext";

export declare namespace SidebarGroup {
    export type Props = PropsWithChildren<{
        title: ReactElement | string;
        includeTopMargin?: boolean;
    }>;
}

export const SidebarGroup: React.FC<SidebarGroup.Props> = ({ title, includeTopMargin = false, children }) => {
    const sidebarContext = useContext(SidebarDepthContext);
    const contextValue = useMemo(
        (): SidebarDepthContextValue => ({ depth: sidebarContext != null ? sidebarContext.depth + 1 : 0 }),
        [sidebarContext]
    );

    return (
        <div
            className={classNames("flex flex-col", {
                "mt-6": includeTopMargin,
            })}
        >
            {title}
            <SidebarDepthContext.Provider value={contextValue}>
                <div className="flex">
                    <div className="flex min-w-0 flex-1 flex-col">{children}</div>
                </div>
            </SidebarDepthContext.Provider>
        </div>
    );
};
