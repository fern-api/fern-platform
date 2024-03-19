import { DocsV1Read } from "@fern-api/fdr-sdk";
import { Dialog, Transition } from "@headlessui/react";
import cn from "clsx";
import { Fragment, memo, useRef } from "react";
import { FernScrollArea } from "../components/FernScrollArea";
import { FernTooltipProvider } from "../components/FernTooltip";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useViewportContext } from "../contexts/viewport-context/useViewportContext";
import { useIsScrolled } from "../docs/useIsScrolled";
import { SearchSidebar } from "../search/SearchDialog";
import { useSearchService } from "../services/useSearchService";
import { useCloseMobileSidebar, useIsMobileSidebarOpen } from "./atom";
import { BuiltWithFern } from "./BuiltWithFern";
import { CollapseSidebarProvider } from "./CollapseSidebarContext";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarSection } from "./SidebarSection";
import { SidebarTabButton } from "./SidebarTabButton";
import { SidebarNavigation } from "./types";

export interface SidebarProps {
    currentSlug: string[];
    navigation: SidebarNavigation;
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    searchInfo: DocsV1Read.SearchInfo;
    algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
    navbarLinks: DocsV1Read.NavbarLink[] | undefined;
    logoHeight: DocsV1Read.Height | undefined;
    logoHref: DocsV1Read.Url | undefined;
    showSearchBar?: boolean;
}

const SidebarInner = memo<SidebarProps>(function SidebarInner({
    navigation,
    currentSlug,
    registerScrolledToPathListener,
    searchInfo,
    algoliaSearchIndex,
    navbarLinks,
    logoHeight,
    logoHref,
    showSearchBar,
}) {
    const { layout } = useDocsContext();
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrolled = useIsScrolled(scrollRef);
    const { layoutBreakpoint } = useViewportContext();
    const isMobileSidebarOpen = useIsMobileSidebarOpen();
    const searchService = useSearchService();

    const renderTabs = () => {
        if (navigation.tabs.length === 0) {
            return null;
        }
        return (
            <ul className="mt-3 flex list-none flex-col">
                {navigation.tabs.map((tab, idx) => (
                    <SidebarTabButton key={idx} tab={tab} selected={idx === navigation.currentTabIndex} />
                ))}
            </ul>
        );
    };

    return (
        <nav
            className={cn("h-full w-full", {
                "lg:pl-1": layout?.disableHeader !== true,
            })}
            aria-label="secondary"
        >
            <FernScrollArea
                className="group/sidebar"
                viewportClassName={cn("px-4 pb-12")}
                scrollbars="vertical"
                viewportRef={scrollRef}
            >
                <SearchSidebar searchService={searchService}>
                    <SidebarFixedItemsSection
                        className="z-10 -mx-4 lg:sticky lg:top-0"
                        searchInfo={searchInfo}
                        algoliaSearchIndex={algoliaSearchIndex}
                        showBorder={
                            isScrolled || (isMobileSidebarOpen && ["mobile", "sm", "md"].includes(layoutBreakpoint))
                        }
                        showSearchBar={showSearchBar}
                        logoHeight={logoHeight}
                        logoHref={logoHref}
                    />
                    {renderTabs()}
                    <CollapseSidebarProvider>
                        <FernTooltipProvider>
                            <SidebarSection
                                navigationItems={navigation.sidebarNodes}
                                slug={currentSlug}
                                registerScrolledToPathListener={registerScrolledToPathListener}
                                depth={0}
                                topLevel={true}
                            />
                        </FernTooltipProvider>
                    </CollapseSidebarProvider>
                    <MobileSidebarHeaderLinks navbarLinks={navbarLinks} />
                </SearchSidebar>
                <BuiltWithFern />
            </FernScrollArea>
        </nav>
    );
});

function MobileSidebar(props: SidebarProps) {
    const isMobileSidebarOpen = useIsMobileSidebarOpen();
    const closeMobileSidebar = useCloseMobileSidebar();

    return (
        <Transition as={Fragment} show={isMobileSidebarOpen}>
            <Dialog onClose={closeMobileSidebar} className="top-header-height fixed inset-0">
                <Transition.Child
                    as="div"
                    className="bg-background/50 top-header-height fixed inset-0 z-auto"
                    enter="transition-opacity ease-linear duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                />
                <Transition.Child
                    as={Dialog.Panel}
                    className="border-concealed bg-background-translucent absolute inset-0 backdrop-blur-lg sm:w-72 sm:border-r"
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
    const { layoutBreakpoint: breakpoint } = useViewportContext();
    if (["lg", "xl", "2xl"].includes(breakpoint)) {
        return (
            <div className={className}>
                <SidebarInner {...props} />
            </div>
        );
    }
    return <MobileSidebar {...props} />;
});
