import clsx from "clsx";
import { useAtomValue } from "jotai";
import { ReactElement, memo } from "react";
import { SIDEBAR_DISMISSABLE_ATOM } from "../atoms";
import { DismissableSidebar } from "./DismissableSidebar";
import { SidebarContainer } from "./SidebarContainer";

export const Sidebar = memo(function Sidebar({ className }: { className?: string }): ReactElement | null {
    const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);

    // We don't want dismissable sidebars showing up on large screens
    //
    // Theoretically, they should show up as fixed SidebarContainers in large viewports
    // but if we want to omit them, and the sidebar data is still there,
    // the SIDEBAR_DISSMISSABLE_ATOM returns true, which results in this dismissable sidebar rendering.
    //
    // Because the implicit expectation is that dismissable sidebar will only render on mobile,
    // its contents are set to be hidden on larger screens, so the content looks invisible, and an empty sidebar appears
    // when the side of the page is hovered.
    //
    // changing the underlying state logic could have unexpected cascading effects,
    // so we hide this sidebar on larger screens instead.
    return showDismissableSidebar ? (
        <div className="lg:hidden">
            <DismissableSidebar className={className} />
        </div>
    ) : (
        <SidebarContainer className={clsx("desktop", className)} />
    );
});
