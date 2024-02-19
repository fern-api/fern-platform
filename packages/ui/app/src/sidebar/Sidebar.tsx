import { DocsV1Read } from "@fern-api/fdr-sdk";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/router";
import { Fragment, memo, useEffect, useRef } from "react";
import { FernScrollArea } from "../components/FernScrollArea";
import { FernTooltipProvider } from "../components/FernTooltip";
import { useIsScrolled } from "../docs/useIsScrolled";
import { SearchSidebar } from "../search/SearchDialog";
import { SearchService } from "../services/useSearchService";
import { useViewportContext } from "../viewport-context/useViewportContext";
import { useCloseMobileSidebar, useIsMobileSidebarOpen } from "./atom";
import { BuiltWithFern } from "./BuiltWithFern";
import { CollapseSidebarProvider } from "./CollapseSidebarContext";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarSection } from "./SidebarSection";
import { SidebarNode } from "./types";

export interface SidebarProps {
    currentSlug: string[];
    navigation: SidebarNode[];
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    searchInfo: DocsV1Read.SearchInfo;
    algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
    navbarLinks: DocsV1Read.NavbarLink[] | undefined;
    searchService: SearchService;
}

const SidebarInner = memo<SidebarProps>(function SidebarInner({
    navigation,
    currentSlug,
    registerScrolledToPathListener,
    searchInfo,
    algoliaSearchIndex,
    navbarLinks,
    searchService,
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrolled = useIsScrolled(scrollRef);
    return (
        <nav className="h-full w-full lg:pl-1" aria-label="secondary">
            <FernScrollArea
                className="group/sidebar"
                viewportClassName="px-4 pb-12"
                aria-orientation="vertical"
                viewportRef={scrollRef}
            >
                <SearchSidebar searchService={searchService}>
                    <MobileSidebarHeaderLinks navbarLinks={navbarLinks} />
                    <SidebarFixedItemsSection
                        className="z-10 -mx-4 lg:sticky lg:top-0"
                        searchInfo={searchInfo}
                        algoliaSearchIndex={algoliaSearchIndex}
                        showBorder={isScrolled}
                    />
                    <CollapseSidebarProvider>
                        <FernTooltipProvider>
                            <SidebarSection
                                navigationItems={navigation}
                                slug={currentSlug}
                                registerScrolledToPathListener={registerScrolledToPathListener}
                                depth={0}
                                topLevel={true}
                            />
                        </FernTooltipProvider>
                    </CollapseSidebarProvider>
                </SearchSidebar>
                <BuiltWithFern />
            </FernScrollArea>
        </nav>
    );
});

function MobileSidebar(props: SidebarProps) {
    const router = useRouter();

    const isMobileSidebarOpen = useIsMobileSidebarOpen();
    const closeMobileSidebar = useCloseMobileSidebar();

    // close the mobile sidebar when the route changes
    useEffect(() => {
        router.events.on("routeChangeComplete", closeMobileSidebar);
        return () => {
            router.events.off("routeChangeComplete", closeMobileSidebar);
        };
    }, [closeMobileSidebar, router.events]);

    return (
        <Transition as={Fragment} show={isMobileSidebarOpen}>
            <Dialog onClose={closeMobileSidebar} className="top-header-height fixed inset-0">
                <Transition.Child
                    as="div"
                    className="bg-background-light/50 dark:bg-background-dark/50 top-header-height fixed inset-0 z-auto"
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
