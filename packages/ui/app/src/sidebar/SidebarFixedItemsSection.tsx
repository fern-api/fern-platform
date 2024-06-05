import { DocsV1Read } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { useMemo } from "react";
import { useDocsContext } from "../contexts/docs-context/useDocsContext.js";
import { HeaderLogoSection } from "../docs/HeaderLogoSection.js";
import { ThemeButton } from "../docs/ThemeButton.js";
import { SidebarSearchBar } from "./SidebarSearchBar.js";
import { useOpenSearchDialog } from "./atom.js";

export declare namespace SidebarFixedItemsSection {
    export interface Props {
        className?: string;
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
        <div className="mx-3 hidden h-header-height-real border-b border-transparent lg:flex lg:items-center lg:justify-between">
            <HeaderLogoSection logoHeight={logoHeight} logoHref={logoHref} />
            <div className="-mr-3">{colors.dark && colors.light && <ThemeButton size="large" />}</div>
        </div>
    );

    return (
        <div
            className={cn(
                "flex flex-col px-4",
                {
                    "lg:pt-4": !header,
                },
                className,
            )}
            data-border={showBorder ? "show" : "hide"}
        >
            {header}
            {searchBar}
        </div>
    );
};
