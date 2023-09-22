import { isUnversionedUntabbedNavigationConfig } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
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
    const {
        docsInfo,
        activeTab,
        activeTabIndex,
        selectedSlug,
        navigateToPath,
        registerScrolledToPathListener,
        getFullSlug,
        docsDefinition,
        resolveApi,
    } = useDocsContext();
    const { closeMobileSidebar } = useMobileSidebarContext();

    const contextValue = useCallback((): SidebarContextValue => ({ expandAllSections }), [expandAllSections]);

    const { activeNavigationConfig } = docsInfo;

    const sidebarItems = useMemo(() => {
        const navigationItems = isUnversionedUntabbedNavigationConfig(activeNavigationConfig)
            ? activeNavigationConfig.items
            : activeTab?.items;
        if (navigationItems == null) {
            return null;
        }
        return (
            <SidebarItems
                navigationItems={navigationItems}
                slug=""
                selectedSlug={selectedSlug}
                navigateToPath={navigateToPath}
                registerScrolledToPathListener={registerScrolledToPathListener}
                getFullSlug={getFullSlug}
                closeMobileSidebar={closeMobileSidebar}
                docsDefinition={docsDefinition}
                docsInfo={docsInfo}
                activeTabIndex={activeTabIndex}
                resolveApi={resolveApi}
            />
        );
    }, [
        activeNavigationConfig,
        activeTab,
        activeTabIndex,
        closeMobileSidebar,
        docsDefinition,
        docsInfo,
        getFullSlug,
        navigateToPath,
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
