import { DocsV1Read } from "@fern-api/fdr-sdk";
import { ResolvedNavigationItem } from "@fern-ui/app-utils";
import { FernScrollArea } from "../components/FernScrollArea";
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

export const Sidebar: React.FC<SidebarProps> = ({
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
