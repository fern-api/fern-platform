import { DocsV1Read } from "@fern-api/fdr-sdk";
import LanguageIcon from "@mui/icons-material/Language";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { CSSProperties, PropsWithChildren, forwardRef, memo } from "react";
import { FernLink } from "../components/FernLink";
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
            className={cn("flex justify-between items-center px-6 shrink-0 h-full", className)}
            ref={ref}
            style={style}
        >
            <HeaderLogoSection logoHeight={logoHeight} logoHref={logoHref} />

            <ul className="fern-tabs flex-1 ml-[0.5px] max-lg:hidden">
                <li className="fern-tab">
                    <FernLink className="group/tab-button" href="/api" data-state="active">
                        <div className="flex min-w-0 items-center justify-start space-x-2">
                            <span className="truncate font-medium font-headings">Gemini API</span>
                        </div>
                    </FernLink>
                </li>
                <li className="fern-tab">
                    <FernLink className="group/tab-button" href="https://ai.google.dev/gemma" data-state="inactive">
                        <div className="flex min-w-0 items-center justify-start space-x-2">
                            <span className="truncate font-medium font-headings">Gemma</span>
                        </div>
                    </FernLink>
                </li>
                <li className="fern-tab">
                    <FernLink className="group/tab-button" href="https://ai.google.dev/edge" data-state="inactive">
                        <div className="flex min-w-0 items-center justify-start space-x-2">
                            <span className="truncate font-medium font-headings">Google AI Edge</span>
                        </div>
                    </FernLink>
                </li>
                <li className="fern-tab">
                    <FernLink className="group/tab-button" href="https://ai.google.dev/tools" data-state="inactive">
                        <div className="flex min-w-0 items-center justify-start space-x-2">
                            <span className="truncate font-medium font-headings">Tools</span>
                            <span className="pl-3.5">
                                <TriangleDownIcon className="size-[16px] scale-x-125 text-black -mr-0.5" />
                            </span>
                        </div>
                    </FernLink>
                </li>
                <li className="fern-tab">
                    <FernLink className="group/tab-button" href="https://discuss.ai.google.dev/" data-state="inactive">
                        <div className="flex min-w-0 items-center justify-start space-x-2">
                            <span className="truncate font-medium font-headings">Community</span>
                            <span>
                                <OpenInNewIcon className="size-[18px] -ml-1 -mt-0.5" />
                            </span>
                        </div>
                    </FernLink>
                </li>
            </ul>

            <div className="flex items-center">
                <SidebarSearchBar onClick={openSearchDialog} className="max-lg:hidden" />

                <button className="size-8 rounded-full t-muted ml-4 hover:bg-tag-default transition-colors lg:hidden">
                    <SearchIcon />
                </button>

                <button className="h-9 t-muted border-default border rounded-[4px] px-2.5 inline-flex items-center gap-2 ml-4 hover:bg-tag-default  transition-colors">
                    <LanguageIcon />
                    <span className="text-sm font-medium ">English</span>
                    <TriangleDownIcon className="size-[16px] scale-x-125 -ml-1 mr-0.5" />
                </button>

                <button className="size-8 rounded-full border border-default t-muted ml-4 hover:bg-tag-default  transition-colors">
                    <MoreVertIcon />
                </button>

                <button className="size-8 rounded-full bg-accent opacity-90 ml-4"></button>
            </div>
        </nav>
    );
});

export const Header = memo(UnmemoizedHeader);

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
    }
}
