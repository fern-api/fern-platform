import classNames from "classnames";
import { useCallback, useState } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useSearchContext } from "../search-context/useSearchContext";
import { useSearchService } from "../services/useSearchService";
import { isUnversionedUntabbedNavigationConfig } from "../util/docs";
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
                                <div className="border-border-default-light dark:border-border-default-dark border-b">
                                    {activeNavigationConfig.tabs.map((tab, idx) => (
                                        <button key={idx} onClick={() => setSelectedTabIndex(idx)}>
                                            {tab.title}
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
