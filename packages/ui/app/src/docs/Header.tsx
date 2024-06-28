import { DocsV1Read } from "@fern-api/fdr-sdk";
import { FernButton, FernButtonGroup } from "@fern-ui/components";
import { ArrowRightIcon, Cross1Icon, HamburgerMenuIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { useAtomValue } from "jotai";
import { CSSProperties, PropsWithChildren, forwardRef, memo } from "react";
import { FernLinkButton } from "../components/FernLinkButton";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { SEARCH_BOX_MOUNTED } from "../search/algolia/SearchBox";
import { useSearchConfig } from "../services/useSearchService";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { useOpenSearchDialog } from "../sidebar/atom";
import { getGitHubRepo } from "../util/github";
import { GitHubWidget } from "./GitHubWidget";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { ThemeButton } from "./ThemeButton";

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
        navbarLinks,
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        showSearchBar = true,
        logoHeight,
        logoHref,
    },
    ref,
) {
    const { colors } = useDocsContext();
    const openSearchDialog = useOpenSearchDialog();
    const isSearchBoxMounted = useAtomValue(SEARCH_BOX_MOUNTED);
    const [searchService] = useSearchConfig();

    const navbarLinksSection = (
        <div className="hidden lg:block">
            <FernButtonGroup>
                {navbarLinks.map((navbarLink, idx) => {
                    if (navbarLink.type === "github") {
                        const repo = getGitHubRepo(navbarLink.url);
                        return repo && <GitHubWidget key={idx} repo={repo} />;
                    }

                    return (
                        <FernLinkButton
                            key={idx}
                            className="group cursor-pointer"
                            href={navbarLink.url}
                            icon={navbarLink.icon}
                            intent={navbarLink.type === "primary" || navbarLink.type === "filled" ? "primary" : "none"}
                            rightIcon={
                                navbarLink.rightIcon ??
                                (navbarLink.type === "primary" ||
                                (navbarLink.type === "filled" && idx === navbarLinks.length - 1) ? (
                                    <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                                ) : undefined)
                            }
                            variant={
                                navbarLink.type === "primary"
                                    ? "outlined"
                                    : navbarLink.type === "secondary"
                                      ? "minimal"
                                      : navbarLink.type
                            }
                            rounded={navbarLink.rounded}
                        >
                            {navbarLink.text}
                        </FernLinkButton>
                    );
                })}

                {colors.dark && colors.light && <ThemeButton className="hidden lg:flex" />}
            </FernButtonGroup>
        </div>
    );

    const githubLink = navbarLinks.find((link) => link.type === "github");
    const githubRepo = githubLink && getGitHubRepo(githubLink.url);

    return (
        <nav
            aria-label="primary"
            className={cn("flex justify-between items-center px-4 md:px-6 lg:px-8 shrink-0 h-full", className)}
            ref={ref}
            style={style}
        >
            <HeaderLogoSection logoHeight={logoHeight} logoHref={logoHref} />

            {showSearchBar && (
                <div
                    className={cn("max-w-content-width w-full max-lg:hidden shrink min-w-0 mx-2", {
                        invisible: isSearchBoxMounted,
                    })}
                >
                    <SidebarSearchBar className="w-full" />
                </div>
            )}

            <div
                className={cn("-mr-1 flex items-center justify-end space-x-0 md:mr-0 lg:space-x-4", {
                    "flex-1": showSearchBar,
                })}
            >
                {navbarLinksSection}

                <div className="flex items-center lg:hidden">
                    {githubRepo && <GitHubWidget repo={githubRepo} />}

                    {colors.dark && colors.light && <ThemeButton size="large" />}

                    {searchService.isAvailable && (
                        <FernButton
                            onClickCapture={(e) => {
                                e.stopPropagation();
                                openSearchDialog();
                            }}
                            icon={<MagnifyingGlassIcon className="!size-5" />}
                            intent="none"
                            variant="minimal"
                            rounded={true}
                            size="large"
                            className="hidden sm:inline"
                        />
                    )}

                    <FernButton
                        onClickCapture={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (isMobileSidebarOpen) {
                                closeMobileSidebar();
                            } else {
                                openMobileSidebar();
                            }
                        }}
                        icon={
                            isMobileSidebarOpen ? (
                                <Cross1Icon className="!size-5" />
                            ) : (
                                <HamburgerMenuIcon className="!size-5" />
                            )
                        }
                        intent={isMobileSidebarOpen ? "primary" : "none"}
                        variant={isMobileSidebarOpen ? "filled" : "minimal"}
                        rounded={true}
                        size="large"
                    />
                </div>
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
