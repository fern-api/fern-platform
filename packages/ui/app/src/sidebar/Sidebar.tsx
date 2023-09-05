import classNames from "classnames";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    const [curScrollPosition, setCurScrollPosition] = useState<"nil" | "sm" | "md" | "lg" | "xl">("nil");

    const contextValue = useCallback((): SidebarContextValue => ({ expandAllSections }), [expandAllSections]);

    useEffect(() => {
        const elem = scrollableContainerRef.current;
        if (elem == null) {
            return;
        }
        const handleScroll = () => {
            const scrollTop = elem.scrollTop;
            if (scrollTop === 0) {
                setCurScrollPosition("nil");
            } else if (scrollTop > 0 && scrollTop <= 3) {
                setCurScrollPosition("sm");
            } else if (scrollTop > 3 && scrollTop <= 6) {
                setCurScrollPosition("md");
            } else if (scrollTop > 6 && scrollTop <= 10) {
                setCurScrollPosition("lg");
            } else if (scrollTop > 10) {
                setCurScrollPosition("xl");
            }
        };
        elem.addEventListener("scroll", handleScroll);
        return () => {
            elem.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const searchBarBoxShadow = useMemo(() => {
        const shadowColor = "rgb(var(--background))";
        switch (curScrollPosition) {
            case "nil":
                return undefined;
            case "sm":
                return `0px 6px 4px ${shadowColor}`;
            case "md":
                return `0px 12px 8px ${shadowColor}`;
            case "lg":
                return `0px 16px 12px ${shadowColor}`;
            case "xl":
                return `0px 24px 16px ${shadowColor}`;
        }
    }, [curScrollPosition]);

    return (
        <SidebarContext.Provider value={contextValue}>
            <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
                {!hideSearchBar && (
                    <div className="z-10 flex flex-col px-2.5 pt-8 md:pl-4">
                        {searchService.isAvailable && (
                            <SidebarSearchBar
                                style={{
                                    boxShadow: searchBarBoxShadow,
                                }}
                                onClick={openSearchDialog}
                            />
                        )}
                    </div>
                )}
                <div
                    ref={scrollableContainerRef}
                    className={classNames(
                        "pl-2.5 md:pl-4 flex flex-1 flex-col overflow-y-auto overflow-x-hidden pb-6 pr-2.5",
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
