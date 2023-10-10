import { getFirstNavigatableItem, isUnversionedTabbedNavigationConfig } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { useNavigationContext } from "../navigation-context";
import { useSearchContext } from "../search-context/useSearchContext";
import { useSearchService } from "../services/useSearchService";
import { SidebarSearchBar } from "./SidebarSearchBar";
import { SidebarTabButton } from "./SidebarTabButton";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
        hideSearchBar: boolean;
    }
}

const UnmemoizedSidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({ className, hideSearchBar }) => {
    const { navigateToPath, getFullSlug } = useNavigationContext();
    const { theme } = useDocsContext();
    const { openSearchDialog } = useSearchContext();
    const searchService = useSearchService();
    const { activeNavigationConfig } = docsInfo;

    const showSearchBar = !hideSearchBar && searchService.isAvailable;
    const showTabs = isUnversionedTabbedNavigationConfig(activeNavigationConfig);
    const router = useRouter();

    const searchBar = useMemo(() => {
        return showSearchBar ? <SidebarSearchBar theme={theme} onClick={openSearchDialog} /> : null;
    }, [theme, showSearchBar, openSearchDialog]);

    const tabs = useMemo(() => {
        if (!showTabs) {
            return null;
        }
        return (
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
        );
    }, [showTabs, activeNavigationConfig, activeTabIndex, getFullSlug, navigateToPath, router]);

    if (!showSearchBar && !showTabs) {
        return null;
    }

    return (
        <div
            className={classNames(
                "flex flex-col px-2 md:px-4 md:pt-8",
                {
                    "backdrop-blur-sm": tabs == null,
                    "backdrop-blur-xl": tabs != null,
                },
                {
                    "border-b border-border-concealed-light dark:border-border-concealed-dark": tabs != null,
                },
                {
                    "pb-2": tabs != null,
                },
                className
            )}
        >
            {searchBar}
            {tabs}
        </div>
    );
};

export const SidebarFixedItemsSection = memo(UnmemoizedSidebarFixedItemsSection);
