import { FernScrollArea, FernTooltipProvider } from "@fern-ui/components";
import clsx from "clsx";
import { ComponentPropsWithoutRef, forwardRef, memo, useRef } from "react";
import { useSidebarNodes } from "../atoms/navigation";
import { useIsMobileSidebarOpen } from "../atoms/sidebar";
import { useLayoutBreakpointValue } from "../atoms/viewport";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useIsScrolled } from "../docs/useIsScrolled";
import { SearchSidebar } from "../search/SearchDialog";
import { CollapseSidebarProvider } from "./CollapseSidebarContext";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarTabButton } from "./SidebarTabButton";
import { SidebarRootNode } from "./nodes/SidebarRootNode";

interface SidebarContainerProps extends ComponentPropsWithoutRef<"nav"> {
    className?: string;
}

const UnmemoizedSidebarContainer = forwardRef<HTMLElement, SidebarContainerProps>(function DesktopSidebar(props, ref) {
    const { layout, tabs, currentTabIndex } = useDocsContext();
    const sidebar = useSidebarNodes();
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrolled = useIsScrolled(scrollRef);
    const layoutBreakpoint = useLayoutBreakpointValue();
    const isMobileSidebarOpen = useIsMobileSidebarOpen();

    return (
        <nav aria-label="secondary" ref={ref} {...props} className={clsx("fern-sidebar-container", props.className)}>
            <SidebarFixedItemsSection
                showBorder={isScrolled || (isMobileSidebarOpen && ["mobile", "sm", "md"].includes(layoutBreakpoint))}
            />
            <SearchSidebar>
                <FernScrollArea
                    rootClassName="flex-1 shrink-1"
                    className={clsx("group/sidebar fern-sidebar-content", {
                        "overscroll-contain": layout?.disableHeader === true,
                    })}
                    scrollbars="vertical"
                    ref={scrollRef}
                >
                    {tabs.length > 0 && (
                        <ul
                            className={clsx("mt-5 mb-6 flex list-none flex-col", {
                                "lg:hidden": layout?.disableHeader !== true && layout?.tabsPlacement === "HEADER",
                            })}
                        >
                            {tabs.map((tab, idx) => (
                                <SidebarTabButton key={idx} tab={tab} selected={tab.index === currentTabIndex} />
                            ))}
                        </ul>
                    )}
                    <CollapseSidebarProvider scrollRef={scrollRef}>
                        <FernTooltipProvider>
                            <SidebarRootNode node={sidebar} />
                        </FernTooltipProvider>
                    </CollapseSidebarProvider>
                    <MobileSidebarHeaderLinks />
                </FernScrollArea>
            </SearchSidebar>
        </nav>
    );
});

export const SidebarContainer = memo(UnmemoizedSidebarContainer);
