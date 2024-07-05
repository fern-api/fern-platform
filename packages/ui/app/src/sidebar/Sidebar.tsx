import clsx from "clsx";
import { useAtomValue } from "jotai";
import { ReactElement, memo } from "react";
import { SIDEBAR_DISABLED_ATOM, SIDEBAR_DISMISSABLE_ATOM } from "../atoms/sidebar";
import { DismissableSidebar } from "./DismissableSidebar";
import { SidebarContainer } from "./SidebarContainer";

export const Sidebar = memo(function Sidebar({ className }: { className?: string }): ReactElement | null {
    const isSidebarDisabled = useAtomValue(SIDEBAR_DISABLED_ATOM);
    const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

    if (isSidebarDisabled) {
        return null;
    }

    return showDismissableSidebar ? (
        <DismissableSidebar className={className} />
    ) : (
        <SidebarContainer className={clsx("desktop", className)} />
    );
});
