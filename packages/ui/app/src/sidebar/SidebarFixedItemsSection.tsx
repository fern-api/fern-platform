import { DocsV1Read } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { useMemo } from "react";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { useNavigationContext } from "../contexts/navigation-context";
import { HeaderLogoSection } from "../docs/HeaderLogoSection";
import { ThemeButton } from "../docs/ThemeButton";
import { useOpenSearchDialog } from "./atom";
import { SidebarSearchBar } from "./SidebarSearchBar";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
        searchInfo: DocsV1Read.SearchInfo;
        algoliaSearchIndex: DocsV1Read.AlgoliaSearchIndex | undefined;
        logoHeight: DocsV1Read.Height | undefined;
        logoHref: DocsV1Read.Url | undefined;
        showBorder?: boolean;
        showSearchBar?: boolean;
        currentTabIndex?: number | undefined;
    }
}

export const SidebarFixedItemsSection: React.FC<SidebarFixedItemsSection.Props> = ({
    className,
    showBorder,
    showSearchBar,
    logoHeight,
    logoHref,
}) => {
    const openSearchDialog = useOpenSearchDialog();
    const { layout, colors } = useDocsContext();
    const { navigation } = useNavigationContext();

    const searchBar = useMemo(() => {
        return showSearchBar ? (
            <div className="mb-3 hidden last:mb-0 lg:block">
                <SidebarSearchBar onClick={openSearchDialog} className="w-full" />
            </div>
        ) : null;
    }, [showSearchBar, openSearchDialog]);

    if (!showSearchBar) {
        return null;
    }

    const header = layout?.disableHeader && (
        <div className="h-header-height-real mx-2 hidden border-b border-transparent lg:flex lg:items-center lg:justify-between">
            <HeaderLogoSection
                logoHeight={logoHeight}
                logoHref={logoHref}
                versions={navigation.versions}
                currentVersionIndex={navigation.currentVersionIndex}
            />
            <div className="-mr-2">{colors.dark && colors.light && <ThemeButton size="large" />}</div>
        </div>
    );

    return (
        <div
            className={cn(
                "flex flex-col px-4 lg:backdrop-blur",
                {
                    "lg:pt-4": !header,
                },
                // {
                //     "border-b data-[border=show]:border-concealed data-[border=hide]:border-transparent": tabs != null,
                // },
                // {
                //     "py-4 lg:pb-2": tabs != null,
                // },
                className,
            )}
            data-border={showBorder ? "show" : "hide"}
        >
            {header}

            {searchBar}

            {/* <div className="from-background absolute inset-x-0 top-full -ml-4 mt-px h-8 bg-gradient-to-b" /> */}
        </div>
    );
};
