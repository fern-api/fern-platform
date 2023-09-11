import { Text } from "@blueprintjs/core";
import { getFirstNavigatableItem, isUnversionedUntabbedNavigationConfig } from "@fern-ui/app-utils";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
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
    const { docsInfo, getFullSlug, navigateToPath, activeTab, activeTabIndex, setActiveTabIndex } = useDocsContext();
    const { openSearchDialog } = useSearchContext();
    const searchService = useSearchService();
    const router = useRouter();

    const contextValue = useCallback((): SidebarContextValue => ({ expandAllSections }), [expandAllSections]);

    const { activeNavigationConfig } = docsInfo;

    return (
        <SidebarContext.Provider value={contextValue}>
            <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
                {!hideSearchBar && (
                    <div className="z-10 flex flex-col pr-2.5 pt-8">
                        {searchService.isAvailable && <SidebarSearchBar onClick={openSearchDialog} />}
                    </div>
                )}

                <div
                    className={classNames(
                        "flex flex-1 flex-col overflow-y-auto overflow-x-hidden pb-6 pr-2.5",
                        styles.scrollingContainer
                    )}
                >
                    {(() => {
                        if (isUnversionedUntabbedNavigationConfig(activeNavigationConfig)) {
                            return <SidebarItems navigationItems={activeNavigationConfig.items} slug="" />;
                        }
                        if (activeTab == null) {
                            return null;
                        }
                        return (
                            <>
                                <div className="mt-3 flex flex-col">
                                    {activeNavigationConfig.tabs.map((tab, idx) => {
                                        const [firstTabItem] = tab.items;
                                        if (firstTabItem == null) {
                                            return null;
                                        }
                                        const slugToNavigate = getFirstNavigatableItem(firstTabItem);
                                        if (slugToNavigate == null) {
                                            return null;
                                        }
                                        return (
                                            <button
                                                key={idx}
                                                className={classNames(
                                                    "flex flex-1 py-2 px-3 group/tab-button transition rounded-lg justify-start items-center !no-underline select-none min-w-0",
                                                    {
                                                        "!text-accent-primary": idx === activeTabIndex,
                                                        "!t-muted hover:!text-accent-primary": idx !== activeTabIndex,
                                                    }
                                                )}
                                                onClick={() => {
                                                    setActiveTabIndex(idx);
                                                    if (slugToNavigate != null) {
                                                        void router.push(
                                                            "/" + getFullSlug(slugToNavigate, { tabSlug: tab.urlSlug })
                                                        );
                                                        navigateToPath(slugToNavigate);
                                                    }
                                                }}
                                            >
                                                <div className="flex min-w-0 items-center justify-start space-x-3">
                                                    <div className="min-w-fit">
                                                        <FontAwesomeIcon
                                                            className={classNames("h-5 w-5", {
                                                                "text-accent-primary": idx === activeTabIndex,
                                                                "t-muted group-hover/tab-button:text-accent-primary":
                                                                    idx !== activeTabIndex,
                                                            })}
                                                            icon={tab.icon as IconProp}
                                                        />
                                                    </div>

                                                    <Text ellipsize>{tab.title}</Text>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <SidebarItems navigationItems={activeTab.items} slug="" />;
                            </>
                        );
                    })()}
                    <BuiltWithFern />
                </div>
            </div>
        </SidebarContext.Provider>
    );
};
