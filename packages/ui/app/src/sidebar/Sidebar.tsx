import { useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { resolveNavigationItems } from "../util/resolver";
import { BuiltWithFern } from "./BuiltWithFern";
import { CollapseSidebarProvider } from "./CollapseSidebarContext";
import { MobileSidebarHeaderLinks } from "./MobileSidebarHeaderLinks";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarSection } from "./SidebarSection";

export declare namespace Sidebar {
    export interface Props {}
}

export const Sidebar: React.FC<Sidebar.Props> = () => {
    const { docsDefinition, resolveApi } = useDocsContext();
    const { activeNavigatable, registerScrolledToPathListener } = useNavigationContext();
    const { activeNavigationConfigContext, withVersionAndTabSlugs } = useDocsSelectors();

    const currentSlug = useMemo(
        () =>
            withVersionAndTabSlugs("", { omitDefault: true })
                .split("/")
                .filter((s) => s.length > 0),
        [withVersionAndTabSlugs]
    );

    const navigationItems = useMemo(() => {
        const unresolvedNavigationItems =
            activeNavigationConfigContext.type === "tabbed"
                ? activeNavigatable.context.tab?.items
                : activeNavigationConfigContext.config.items;
        return resolveNavigationItems(unresolvedNavigationItems ?? [], docsDefinition, currentSlug);
    }, [
        activeNavigatable.context.tab?.items,
        activeNavigationConfigContext.config,
        activeNavigationConfigContext.type,
        currentSlug,
        docsDefinition,
    ]);

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
                    docsDefinition={docsDefinition}
                    activeTabIndex={activeNavigatable.context.tab?.index ?? null}
                    resolveApi={resolveApi}
                    depth={0}
                    topLevel={true}
                />
            </CollapseSidebarProvider>
            <BuiltWithFern />
        </nav>
    );
};
