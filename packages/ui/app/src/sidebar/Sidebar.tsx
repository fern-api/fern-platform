import { Text } from "@blueprintjs/core";
import { getFirstNavigatableItem, isUnversionedUntabbedNavigationConfig } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";
import { FontAwesomeIconClient } from "../commons/FontAwesomeIconClient";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useMobileSidebarContext } from "../mobile-sidebar-context/useMobileSidebarContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { useSearchService } from "../services/useSearchService";
import { BuiltWithFern } from "./BuiltWithFern";
import { SidebarContext, SidebarContextValue } from "./context/SidebarContext";
import styles from "./Sidebar.module.scss";
import { SidebarItems } from "./SidebarItems";
import { SidebarSearchBar } from "./SidebarSearchBar";

export declare namespace Sidebar {
    export interface Props {
        hideSearchBar?: boolean;
        expandAllSections?: boolean;
    }
}

export const Sidebar: React.FC<Sidebar.Props> = ({ hideSearchBar = false, expandAllSections = false }) => {
    const {
        docsInfo,
        selectedSlug,
        navigateToPath,
        registerScrolledToPathListener,
        getFullSlug,
        docsDefinition,
        resolveApi,
    } = useDocsContext();
    const { openSearchDialog } = useSearchContext();
    const { closeMobileSidebar } = useMobileSidebarContext();
    const searchService = useSearchService();
    const [activeTabIndex, _setActiveTabIndex] = useState(0);
    const router = useRouter();

    const setActiveTabIndex = useCallback((index: number) => _setActiveTabIndex(index), []);

    const contextValue = useCallback(
        (): SidebarContextValue => ({ expandAllSections, activeTabIndex, setActiveTabIndex }),
        [expandAllSections, activeTabIndex, setActiveTabIndex]
    );

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
        const selectedTab = activeNavigationConfig.tabs[activeTabIndex];
        if (selectedTab == null) {
            return null;
        }
        return (
            <>
                <div className="mt-3 flex flex-col">
                    {activeNavigationConfig.tabs.map((tab, idx) => (
                        <button
                            key={idx}
                            className={classNames(
                                "flex flex-1 py-2 px-3 group/tab-button transition rounded-lg justify-start items-center select-none min-w-0",
                                {
                                    "text-accent-primary": idx === activeTabIndex,
                                    "t-muted hover:text-accent-primary": idx !== activeTabIndex,
                                }
                            )}
                            onClick={() => {
                                _setActiveTabIndex(idx);
                                const [firstTabItem] = tab.items;
                                if (firstTabItem == null) {
                                    return;
                                }
                                const slugToNavigate = getFirstNavigatableItem(firstTabItem);
                                if (slugToNavigate != null) {
                                    void router.push("/" + getFullSlug(slugToNavigate));
                                    navigateToPath(slugToNavigate);
                                }
                            }}
                        >
                            <div className="flex min-w-0 items-center justify-start space-x-3">
                                <div className="min-w-fit">
                                    <FontAwesomeIconClient
                                        className={classNames("h-5 w-5", {
                                            "text-accent-primary": idx === activeTabIndex,
                                            "t-muted group-hover/tab-button:text-accent-primary":
                                                idx !== activeTabIndex,
                                        })}
                                        icon={tab.icon}
                                    />
                                </div>

                                <Text ellipsize>{tab.title}</Text>
                            </div>
                        </button>
                    ))}
                </div>
                <SidebarItems
                    navigationItems={selectedTab.items}
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
                {!hideSearchBar && (
                    <div className="sticky top-0 z-10 flex flex-col px-4 pt-8 backdrop-blur-sm">
                        {searchService.isAvailable && <SidebarSearchBar onClick={openSearchDialog} />}
                    </div>
                )}

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
