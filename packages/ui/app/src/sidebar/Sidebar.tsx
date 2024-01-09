import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { BuiltWithFern } from "./BuiltWithFern";
import { CollapseSidebarProvider } from "./CollapseSidebarContext";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarSection } from "./SidebarSection";

export declare namespace Sidebar {
    export interface Props {}
}

export const Sidebar: React.FC<Sidebar.Props> = () => {
    const { docsDefinition, resolveApi } = useDocsContext();
    const { activeNavigatable, registerScrolledToPathListener } = useNavigationContext();
    const { activeNavigationConfigContext, withVersionAndTabSlugs, selectedSlug } = useDocsSelectors();
    const { closeMobileSidebar } = useMobileSidebarContext();

    const navigationItems =
        activeNavigationConfigContext.type === "tabbed"
            ? activeNavigatable.context.tab?.items
            : activeNavigationConfigContext.config.items;

    return (
        <nav
            className="group/sidebar smooth-scroll hide-scrollbar relative h-full w-full overflow-x-hidden overflow-y-scroll overscroll-contain px-4 pb-12 md:overflow-y-auto"
            aria-label="secondary"
        >
            <SidebarFixedItemsSection className="-mx-4 md:sticky md:top-0 md:z-20" />
            {navigationItems != null && (
                <CollapseSidebarProvider>
                    <SidebarSection
                        navigationItems={navigationItems}
                        slug={withVersionAndTabSlugs("", { omitDefault: true })}
                        selectedSlug={selectedSlug}
                        registerScrolledToPathListener={registerScrolledToPathListener}
                        closeMobileSidebar={closeMobileSidebar}
                        docsDefinition={docsDefinition}
                        activeTabIndex={activeNavigatable.context.tab?.index ?? null}
                        resolveApi={resolveApi}
                        depth={0}
                        topLevel={true}
                    />
                </CollapseSidebarProvider>
            )}
            <BuiltWithFern />
        </nav>
    );
};
