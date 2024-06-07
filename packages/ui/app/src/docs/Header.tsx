import { DocsV1Read } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { CSSProperties, PropsWithChildren, forwardRef, memo } from "react";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { useOpenSearchDialog } from "../sidebar/atom";
import { HeaderLogoSection } from "./HeaderLogoSection";

export declare namespace Header {
    export interface Props {
        className?: string;
        style?: CSSProperties;
        navbarLinks: DocsV1Read.NavbarLink[];
        logoHeight: DocsV1Read.Height | undefined;
        logoHref: DocsV1Read.Url | undefined;
        isMobileSidebarOpen: boolean;
        openMobileSidebar: () => void;
        closeMobileSidebar: () => void;
        showSearchBar?: boolean;
    }
}

const UnmemoizedHeader = forwardRef<HTMLDivElement, PropsWithChildren<Header.Props>>(function Header(
    {
        className,
        style,
        // navbarLinks,
        // isMobileSidebarOpen,
        // openMobileSidebar,
        // closeMobileSidebar,
        // showSearchBar = true,
        logoHeight,
        logoHref,
    },
    ref,
) {
    // const { colors } = useDocsContext();
    const openSearchDialog = useOpenSearchDialog();
    // const isSearchBoxMounted = useAtomValue(SEARCH_BOX_MOUNTED);
    // const searchService = useSearchService();

    return (
        <nav
            aria-label="primary"
            className={cn("flex justify-between items-center px-4 md:px-6 lg:px-8 shrink-0 h-full", className)}
            ref={ref}
            style={style}
        >
            <HeaderLogoSection logoHeight={logoHeight} logoHref={logoHref} />

            <SidebarSearchBar onClick={openSearchDialog} />
        </nav>
    );
});

export const Header = memo(UnmemoizedHeader);

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
    }
}
