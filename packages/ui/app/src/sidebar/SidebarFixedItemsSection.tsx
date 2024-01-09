import classNames from "classnames";
import { useMemo } from "react";
import { useNavigationContext } from "../navigation-context";
import { useSearchContext } from "../search-context/useSearchContext";
import { useDocsSelectors } from "../selectors/useDocsSelectors";
import { useSearchService } from "../services/useSearchService";
import { SidebarSearchBar } from "./SidebarSearchBar";
import { SidebarTabButton } from "./SidebarTabButton";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
        hideSearchBar: boolean;
    }
}

export const SidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({ className, hideSearchBar }) => {
    const { activeNavigatable } = useNavigationContext();
    const { activeNavigationConfigContext, withVersionSlug } = useDocsSelectors();
    const { openSearchDialog } = useSearchContext();
    const searchService = useSearchService();

    const showSearchBar = !hideSearchBar && searchService.isAvailable;
    const showTabs = activeNavigationConfigContext.type === "tabbed";

    const searchBar = useMemo(() => {
        return showSearchBar ? <SidebarSearchBar onClick={openSearchDialog} /> : null;
    }, [showSearchBar, openSearchDialog]);

    const tabs = useMemo(() => {
        if (!showTabs) {
            return null;
        }
        return (
            <ul className="mt-3 flex list-none flex-col">
                {activeNavigationConfigContext.config.tabs.map((tab, idx) => (
                    <SidebarTabButton
                        key={idx}
                        tab={tab}
                        selected={idx === activeNavigatable.context.tab?.index}
                        slug={withVersionSlug(tab.urlSlug, { omitDefault: true })}
                    />
                ))}
            </ul>
        );
    }, [showTabs, activeNavigationConfigContext, activeNavigatable, withVersionSlug]);

    if (!showSearchBar && !showTabs) {
        return null;
    }

    return (
        <div
            className={classNames(
                "flex flex-col px-4 md:pt-8",
                {
                    "backdrop-blur-sm": tabs == null,
                    "backdrop-blur-lg": tabs != null,
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
