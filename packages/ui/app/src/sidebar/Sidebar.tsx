import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ResolvedNavigationItem } from "@fern-ui/app-utils";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, memo } from "react";
import { FernScrollArea } from "../components/FernScrollArea";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useViewportContext } from "../viewport-context/useViewportContext";
import { BuiltWithFern } from "./BuiltWithFern";
import { CollapseSidebarProvider } from "./CollapseSidebarContext";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarSection } from "./SidebarSection";

export interface SidebarProps {
    currentSlug: string[];
    navigationItems: ResolvedNavigationItem[];
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
    searchInfo: DocsV1Read.SearchInfo;
    algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | null;
    navbarLinks: DocsV1Read.NavbarLink[] | undefined;
}

const SidebarInner: React.FC<SidebarProps> = ({
    navigationItems,
    currentSlug,
    registerScrolledToPathListener,
    searchInfo,
    algoliaSearchIndex,
    navbarLinks,
}) => {
    return (
        <nav className="h-full w-full" aria-label="secondary">
            <FernScrollArea className="group/sidebar" viewportClassName="px-4 pb-12">
                <MobileSidebarHeaderLinks navbarLinks={navbarLinks} />
                <SidebarFixedItemsSection
                    className="-mx-4 lg:sticky lg:top-0 lg:z-20"
                    searchInfo={searchInfo}
                    algoliaSearchIndex={algoliaSearchIndex}
                />
                <CollapseSidebarProvider>
                    <SidebarSection
                        navigationItems={navigationItems}
                        slug={currentSlug}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        depth={0}
                        topLevel={true}
                    />
                </CollapseSidebarProvider>
                <BuiltWithFern />
            </FernScrollArea>
        </nav>
    );
};

export const Sidebar = memo<SidebarProps>(function Sidebar(props) {
    const { isMobileSidebarOpen, closeMobileSidebar } = useMobileSidebarContext();
    const { layoutBreakpoint: breakpoint } = useViewportContext();

    return ["lg", "xl", "2xl"].includes(breakpoint) ? (
        <div className="w-sidebar-width mt-header-height top-header-height h-vh-minus-header sticky z-20 hidden lg:block">
            <SidebarInner {...props} />
        </div>
    ) : (
        <Transition as={Fragment} show={isMobileSidebarOpen}>
            <Dialog onClose={closeMobileSidebar} className="top-header-height fixed inset-0 z-20">
                <Transition.Child
                    as="div"
                    className="bg-background-light/40 dark:bg-background-dark/40 fixed inset-0 z-0"
                    enter="transition-all ease-linear duration-200"
                    enterFrom="backdrop-blur-0 opacity-0"
                    enterTo="backdrop-blur-sm opacity-100"
                />
                <Transition.Child
                    as={Dialog.Panel}
                    className="border-border-concealed-light dark:border-border-concealed-dark bg-background-light/70 dark:bg-background-dark/70 absolute inset-0 backdrop-blur sm:w-72 sm:border-r"
                    enter="transition ease-in-out duration-300 transform"
                    enterFrom="-translate-y-full sm:translate-y-0 sm:-translate-x-full"
                    enterTo="translate-x-0 translate-y-0"
                    leave="transition ease-in-out duration-300 transform"
                    leaveFrom="translate-x-0 translate-y-0"
                    leaveTo="-translate-y-full sm:translate-y-0 sm:-translate-x-full"
                >
                    <SidebarInner {...props} />
                </Transition.Child>
            </Dialog>
        </Transition>
    );
});
