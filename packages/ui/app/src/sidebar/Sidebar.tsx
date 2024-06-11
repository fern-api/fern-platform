import { DocsV1Read } from "@fern-api/fdr-sdk";
import { FernScrollArea, FernTooltipProvider } from "@fern-ui/components";
import { Dialog, Transition } from "@headlessui/react";
import { clsx as cn } from "clsx";
import { Fragment, memo, useRef } from "react";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useLayoutBreakpoint } from "../contexts/layout-breakpoint/useLayoutBreakpoint";
import { useIsScrolled } from "../docs/useIsScrolled";
import { SearchSidebar } from "../search/SearchDialog";
import { useSearchService } from "../services/useSearchService";
import { CollapseSidebarProvider } from "./CollapseSidebarContext";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarTabButton } from "./SidebarTabButton";
import { useCloseMobileSidebar, useIsMobileSidebarOpen } from "./atom";
import { SidebarRootNode } from "./nodes/SidebarRootNode";

export interface SidebarProps {
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
    showSearchBar?: boolean;
}

const SidebarInner = memo<SidebarProps>(function SidebarInner({ logoHeight, logoHref, showSearchBar }) {
    const { layout, tabs, currentTabIndex, sidebar } = useDocsContext();
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrolled = useIsScrolled(scrollRef);
    const layoutBreakpoint = useLayoutBreakpoint();
    const isMobileSidebarOpen = useIsMobileSidebarOpen();
    const searchService = useSearchService();

    return (
        <nav className={cn("h-full w-full flex flex-col")} aria-label="secondary">
            <SidebarFixedItemsSection
                showBorder={isScrolled || (isMobileSidebarOpen && ["mobile", "sm", "md"].includes(layoutBreakpoint))}
                showSearchBar={showSearchBar}
                logoHeight={logoHeight}
                logoHref={logoHref}
            />
            <SearchSidebar searchService={searchService}>
                <FernScrollArea
                    rootClassName="flex-1"
                    className={cn("group/sidebar mask-grad-y-6 px-0 pb-12", {
                        "overscroll-contain": layout?.disableHeader === true,
                    })}
                    scrollbars="vertical"
                    ref={scrollRef}
                >
                    {tabs.length > 0 && (
                        <ul
                            className={cn("mt-5 mb-6 flex list-none flex-col", {
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

function MobileSidebar(props: SidebarProps) {
    const isMobileSidebarOpen = useIsMobileSidebarOpen();
    const closeMobileSidebar = useCloseMobileSidebar();

    return (
        <Transition as={Fragment} show={isMobileSidebarOpen}>
            <Dialog onClose={closeMobileSidebar} className="fixed inset-0 top-header-height-real z-20">
                <Transition.Child
                    as="div"
                    className="fixed inset-0 top-header-height-real z-auto bg-background/50"
                    enter="transition-opacity ease-linear duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                />
                <Transition.Child
                    as={Dialog.Panel}
                    className="bg-background-translucent border-concealed absolute inset-0 backdrop-blur-lg sm:w-72 sm:border-r"
                    enter="transition ease-in-out duration-300 transform"
                    enterFrom="opacity-0 sm:opacity-100 sm:translate-y-0 sm:-translate-x-full"
                    enterTo="opacity-100 translate-x-0 translate-y-0"
                    leave="transition ease-in-out duration-300 transform"
                    leaveFrom="opacity-100 translate-x-0 translate-y-0"
                    leaveTo="opacity-0 sm:opacity-100 sm:translate-y-0 sm:-translate-x-full"
                >
                    <SidebarInner {...props} />
                </Transition.Child>
            </Dialog>
        </Transition>
    );
}

export const Sidebar = memo<SidebarProps & { className: string }>(function Sidebar({ className, ...props }) {
    const breakpoint = useLayoutBreakpoint();
    if (["lg", "xl", "2xl"].includes(breakpoint)) {
        return (
            <div className={className}>
                <SidebarInner {...props} />
            </div>
        );
    }
    return <MobileSidebar {...props} />;
});
