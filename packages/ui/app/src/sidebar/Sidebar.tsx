import { ResolvedNavigationItem } from "@fern-ui/app-utils";
import { BuiltWithFern } from "./BuiltWithFern";
import { CollapseSidebarProvider } from "./CollapseSidebarContext";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarSection } from "./SidebarSection";

export interface SidebarProps {
    currentSlug: string[];
    navigationItems: ResolvedNavigationItem[];
    registerScrolledToPathListener: (slugWithVersion: string, listener: () => void) => () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ navigationItems, currentSlug, registerScrolledToPathListener }) => {
    return (
        <nav
            className="group/sidebar smooth-scroll hide-scrollbar relative h-full w-full overflow-x-hidden overflow-y-scroll overscroll-contain px-4 pb-12 lg:overflow-y-auto"
            aria-label="secondary"
        >
            <MobileSidebarHeaderLinks />
            <SidebarFixedItemsSection className="-mx-4 lg:sticky lg:top-0 lg:z-20" />
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
        </nav>
    );
};
