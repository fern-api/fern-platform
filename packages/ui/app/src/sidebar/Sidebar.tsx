import { Text } from "@blueprintjs/core";
import { getFirstNavigatableItem, isUnversionedUntabbedNavigationConfig } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { FontAwesomeIcon } from "../commons/FontAwesomeIcon";
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
        setActiveTabIndex,
        activeTab,
        activeTabIndex,
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
                                const [firstTabItem] = tab.items;
                                if (firstTabItem == null) {
                                    return;
                                }
                                const slugToNavigate = getFirstNavigatableItem(firstTabItem);
                                if (slugToNavigate == null) {
                                    return;
                                }
                                setActiveTabIndex(idx);
                                navigateToPath(slugToNavigate, {
                                    omitVersionPrefix: false,
                                    tabSlug: tab.urlSlug,
                                });
                                void router.push("/" + getFullSlug(slugToNavigate, { tabSlug: tab.urlSlug }));
                            }}
                        >
                            <div className="flex min-w-0 items-center justify-start space-x-3">
                                <div className="min-w-fit">
                                    <div
                                        className={classNames(
                                            "flex h-6 w-6 items-center border justify-center rounded-md group-hover/tab-button:bg-tag-primary group-hover/tab-button:border-border-primary",
                                            {
                                                "bg-tag-primary border-border-primary": idx === activeTabIndex,
                                                "bg-tag-default-light/5 dark:bg-tag-default-dark/5 border-transparent":
                                                    idx !== activeTabIndex,
                                            }
                                        )}
                                    >
                                        <FontAwesomeIcon
                                            className={classNames(
                                                "h-3.5 w-3.5 group-hover/tab-button:text-accent-primary",
                                                {
                                                    "text-accent-primary": idx === activeTabIndex,
                                                    "t-muted": idx !== activeTabIndex,
                                                }
                                            )}
                                            icon={tab.icon}
                                        />
                                    </div>
                                </div>

                                <Text ellipsize className="font-medium">
                                    {tab.title}
                                </Text>
                            </div>
                        </button>
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
