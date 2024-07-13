import { SHOW_SEARCH_BAR_IN_SIDEBAR_ATOM, useColors, useOpenSearchDialog } from "@/atoms";
import { DocsV1Read } from "@fern-api/fdr-sdk";
import { FernButton, FernButtonGroup } from "@fern-ui/components";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import cn from "clsx";
import { useAtomValue } from "jotai";
import { isEqual } from "lodash-es";
import { CSSProperties, PropsWithChildren, forwardRef, memo } from "react";
import { FernLinkButton } from "../components/FernLinkButton";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";
import { SEARCH_BOX_MOUNTED } from "../search/algolia/SearchBox";
import { useSearchConfig } from "../services/useSearchService";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { getGitHubRepo } from "../util/github";
import { GitHubWidget } from "./GitHubWidget";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { MobileMenuButton } from "./MobileMenuButton";
import { ThemeButton } from "./ThemeButton";

export declare namespace Header {
    export interface Props {
        className?: string;
        style?: CSSProperties;
    }
}

const UnmemoizedHeader = forwardRef<HTMLDivElement, PropsWithChildren<Header.Props>>(function Header(
    { className, style },
    ref,
) {
    const { navbarLinks } = useDocsContext();
    const colors = useColors();
    const openSearchDialog = useOpenSearchDialog();
    const isSearchBoxMounted = useAtomValue(SEARCH_BOX_MOUNTED);
    const [searchService] = useSearchConfig();
    const showSearchBar = !useAtomValue(SHOW_SEARCH_BAR_IN_SIDEBAR_ATOM);

    const navbarLinksSection = (
        <div className="lg-menu">
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

                {colors.dark && colors.light && <ThemeButton />}
            </FernButtonGroup>
        </div>
    );

    const githubLink = navbarLinks.find((link) => link.type === "github");
    const githubRepo = githubLink && getGitHubRepo(githubLink.url);

    return (
        <nav aria-label="primary" className={cn("fern-header-content", className)} ref={ref} style={style}>
            <HeaderLogoSection />

            {showSearchBar && (
                <div
                    className={cn("fern-header-searchbar", {
                        invisible: isSearchBoxMounted,
                    })}
                >
                    <SidebarSearchBar className="w-full" />
                </div>
            )}

            <div
                className={cn("fern-header-right-menu", {
                    "flex-1": showSearchBar,
                })}
            >
                {navbarLinksSection}

                <div className="max-lg-menu">
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
                            className="max-sm:hidden"
                        />
                    )}

                    <MobileMenuButton />
                </div>
            </div>
        </nav>
    );
});

export const Header = memo(
    UnmemoizedHeader,
    (prev, next) => prev.className === next.className && isEqual(prev.style, next.style),
);

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: DocsV1Read.NavbarLink.Primary;
    }
}
