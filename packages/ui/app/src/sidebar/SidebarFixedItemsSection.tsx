import classNames from "classnames";
import { useRouter } from "next/router";
import { memo, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
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

const UnmemoizedSidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({ className, hideSearchBar }) => {
    const { navigateToPath, activeNavigatable, getSlugWithBasePath } = useNavigationContext();
    const { theme } = useDocsContext();
    const { activeNavigationConfigContext, withVersionSlug } = useDocsSelectors();
    const { openSearchDialog } = useSearchContext();
    const searchService = useSearchService();

    const showSearchBar = !hideSearchBar && searchService.isAvailable;
    const showTabs = activeNavigationConfigContext.type === "tabbed";
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
                {activeNavigationConfigContext.config.tabs.map((tab, idx) => (
                    <SidebarTabButton
                        key={idx}
                        tab={tab}
                        isSelected={idx === activeNavigatable.context.tab?.index}
                        onClick={() => {
                            const fullSlug = withVersionSlug(tab.urlSlug, { omitDefault: true });
                            navigateToPath(fullSlug);
                            void router.replace(`/${getSlugWithBasePath(fullSlug)}`, undefined);
                        }}
                    />
                ))}
            </div>
        );
    }, [
        showTabs,
        activeNavigationConfigContext,
        activeNavigatable,
        withVersionSlug,
        navigateToPath,
        router,
        getSlugWithBasePath,
    ]);

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
