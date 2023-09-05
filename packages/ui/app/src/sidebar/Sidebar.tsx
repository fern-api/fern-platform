import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
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

    const scrollableContainerRef = useRef<HTMLDivElement | null>(null);
    const [curScrollPosition, setCurScrollPosition] = useState(0);

    const contextValue = useCallback((): SidebarContextValue => ({ expandAllSections }), [expandAllSections]);

    useEffect(() => {
        const elem = scrollableContainerRef.current;
        if (elem == null) {
            return;
        }
        const handleScroll = () => {
            setCurScrollPosition(elem.scrollTop);
        };
        elem.addEventListener("scroll", handleScroll);
        return () => {
            elem.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <SidebarContext.Provider value={contextValue}>
            <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
                {!hideSearchBar && (
                    <div className="z-10 flex flex-col pr-2.5 pt-8">
                        {searchService.isAvailable && (
                            <SidebarSearchBar
                                className={classNames("dark:shadow-black", {
                                    shadow: curScrollPosition > 0 && curScrollPosition <= 3,
                                    "shadow-md": curScrollPosition > 3 && curScrollPosition <= 6,
                                    "shadow-lg": curScrollPosition > 6 && curScrollPosition <= 10,
                                    "shadow-xl": curScrollPosition > 10,
                                })}
                                onClick={openSearchDialog}
                            />
                        )}
                    </div>
                )}
                <div
                    ref={scrollableContainerRef}
                    className={classNames(
                        "flex flex-1 flex-col overflow-y-auto overflow-x-hidden pb-6 pr-2.5",
                        styles.scrollingContainer
                    )}
                >
                    <SidebarItems navigationItems={docsInfo.activeNavigationConfig.items} slug="" />
                    <BuiltWithFern />
                </div>
            </div>
        </SidebarContext.Provider>
    );
};
