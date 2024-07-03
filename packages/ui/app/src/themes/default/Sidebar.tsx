import clsx from "clsx";
import { memo } from "react";
import { useLayoutBreakpoint } from "../../atoms/window";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { DesktopSidebar } from "../../sidebar/DesktopSidebar";
import { MobileSidebar } from "../../sidebar/MobileSidebar";
import { SidebarProps } from "../../sidebar/types";

export const Sidebar = memo<SidebarProps & { className: string }>(function Sidebar({ className, ...props }) {
    const { layout } = useDocsContext();
    const breakpoint = useLayoutBreakpoint();
    if (breakpoint.min("lg")) {
        return (
            <div className={className}>
                <DesktopSidebar
                    {...props}
                    className={clsx("fern-sidebar-desktop", {
                        "header-enabled": layout?.disableHeader !== true,
                    })}
                />
            </div>
        );
    }
    return <MobileSidebar {...props} />;
});
