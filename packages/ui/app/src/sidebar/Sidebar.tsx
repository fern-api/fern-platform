import { Text } from "@blueprintjs/core";
import { isUnversionedUntabbedNavigationConfig } from "@fern-ui/app-utils";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import classNames from "classnames";
import { useCallback, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
    const { docsInfo } = useDocsContext();
    const { openSearchDialog } = useSearchContext();
    const searchService = useSearchService();
    const [selectedTabIndex, setSelectedTabIndex] = useState(0);

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
                        const selectedTab = activeNavigationConfig.tabs[selectedTabIndex];
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
                                                    "text-accent-primary": idx === selectedTabIndex,
                                                    "t-muted hover:text-accent-primary": idx !== selectedTabIndex,
                                                }
                                            )}
                                            onClick={() => setSelectedTabIndex(idx)}
                                        >
                                            <div className="flex min-w-0 items-center justify-start space-x-3">
                                                <div className="min-w-fit">
                                                    <FontAwesomeIcon
                                                        className={classNames("h-5 w-5", {
                                                            "text-accent-primary": idx === selectedTabIndex,
                                                            "t-muted group-hover/tab-button:text-accent-primary":
                                                                idx !== selectedTabIndex,
                                                        })}
                                                        icon={tab.icon as IconProp}
                                                    />
                                                </div>

                                                <Text ellipsize>{tab.title}</Text>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <SidebarItems navigationItems={selectedTab.items} slug="" />;
                            </>
                        );
                    })()}
                    <BuiltWithFern />
                </div>
            </div>
        </SidebarContext.Provider>
    );
};
