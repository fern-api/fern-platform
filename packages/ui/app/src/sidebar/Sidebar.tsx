import { getFirstNavigatableItem, isUnversionedUntabbedNavigationConfig } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { BuiltWithFern } from "./BuiltWithFern";
import { SidebarContext, SidebarContextValue } from "./context/SidebarContext";
import styles from "./Sidebar.module.scss";
import { SidebarFixedItemsSection } from "./SidebarFixedItemsSection";
import { SidebarItems } from "./SidebarItems";
import { SidebarTabButton } from "./SidebarTabButton";

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

    const router = useRouter();

    const contextValue = useCallback((): SidebarContextValue => ({ expandAllSections }), [expandAllSections]);

    const { activeNavigationConfig } = docsInfo;

    const renderContents = () => {
        if (isUnversionedUntabbedNavigationConfig(activeNavigationConfig)) {
            return (
                <SidebarItems
                    navigationItems={activeNavigationConfig.items}
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
        }
        if (activeTab == null) {
            return null;
        }
        return (
            <>
                <div className="mt-3 flex flex-col">
                    {activeNavigationConfig.tabs.map((tab, idx) => (
                        <SidebarTabButton
                            key={idx}
                            tab={tab}
                            isSelected={idx === activeTabIndex}
                            onClick={() => {
                                const [firstTabItem] = tab.items;
                                if (firstTabItem == null) {
                                    return;
                                }
                                const slugToNavigate = getFirstNavigatableItem(firstTabItem);
                                if (slugToNavigate == null) {
                                    return;
                                }
                                navigateToPath(slugToNavigate, {
                                    tabSlug: tab.urlSlug,
                                });
                                void router.push("/" + getFullSlug(slugToNavigate, { tabSlug: tab.urlSlug }));
                            }}
                        />
                    ))}
                </div>
                <SidebarItems
                    navigationItems={activeTab.items}
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
                ;
            </>
        );
    };

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
                    {renderContents()}
                    <BuiltWithFern />
                </div>
            </div>
        </SidebarContext.Provider>
    );
};
