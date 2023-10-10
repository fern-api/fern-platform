import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useNavigationContext } from "../navigation-context";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { BuiltWithFern } from "./BuiltWithFern";
import { SidebarContext, SidebarContextValue } from "./context/SidebarContext";
import styles from "./Sidebar.module.scss";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarItems } from "./SidebarItems";

export declare namespace Sidebar {
    export interface Props {
        hideSearchBar?: boolean;
        expandAllSections?: boolean;
    }
}

export const Sidebar: React.FC<Sidebar.Props> = ({ hideSearchBar = false, expandAllSections = false }) => {
    const { docsDefinition, resolveApi } = useDocsContext();
    const { getFullSlug, activeNavigatable, registerScrolledToPathListener } = useNavigationContext();
    const { activeNavigationConfigContext, selectedSlug } = useDocsSelectors();
    const { closeMobileSidebar } = useMobileSidebarContext();

    const contextValue = useCallback((): SidebarContextValue => ({ expandAllSections }), [expandAllSections]);

    const sidebarItems = useMemo(() => {
        const navigationItems =
            activeNavigationConfigContext.type === "tabbed"
                ? activeNavigatable.context.tab?.items
                : activeNavigationConfigContext.config.items;
        if (navigationItems == null) {
            return null;
        }
        return (
            <SidebarItems
                navigationItems={navigationItems}
                slug=""
                selectedSlug={selectedSlug}
                registerScrolledToPathListener={registerScrolledToPathListener}
                getFullSlug={getFullSlug}
                closeMobileSidebar={closeMobileSidebar}
                docsDefinition={docsDefinition}
                activeTabIndex={activeNavigatable.context.tab?.index ?? null}
                resolveApi={resolveApi}
            />
        );
    }, [
        activeNavigationConfigContext,
        activeNavigatable,
        closeMobileSidebar,
        docsDefinition,
        getFullSlug,
        registerScrolledToPathListener,
        resolveApi,
        selectedSlug,
    ]);

    return (
        <SidebarContext.Provider value={contextValue}>
            <div className="w-full min-w-0">
                <SidebarFixedItemsSection className="sticky top-0 z-10" hideSearchBar={hideSearchBar} />
                <div
                    className={classNames(
                        "flex flex-1 flex-col overflow-y-auto overflow-x-hidden pb-6",
                        hideSearchBar ? "px-2.5" : "px-4",
                        styles.scrollingContainer
                    )}
                >
                    {sidebarItems}
                    <BuiltWithFern />
                </div>
            </div>
        </SidebarContext.Provider>
    );
};
