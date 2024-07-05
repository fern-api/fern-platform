import clsx from "clsx";
import { useAtomValue } from "jotai";
import { ReactElement, memo } from "react";
import { SIDEBAR_DISABLED_ATOM, SIDEBAR_DISMISSABLE_ATOM } from "../atoms/sidebar";
import { DesktopSidebar } from "./DesktopSidebar";
import { DismissableSidebar } from "./DismissableSidebar";

export const Sidebar = memo(function Sidebar({ className }: { className?: string }): ReactElement | null {
    const isSidebarDisabled = useAtomValue(SIDEBAR_DISABLED_ATOM);
    const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

    if (isSidebarDisabled) {
        return null;
    }

    return showDismissableSidebar ? (
        <DismissableSidebar className={className} />
    ) : (
        <DesktopSidebar className={clsx("desktop", className)} />
    );
});
