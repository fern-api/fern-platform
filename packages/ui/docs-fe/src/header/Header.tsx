import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernButtonGroup } from "@fern-ui/components";
import clsx from "clsx";
import { ArrowRight, Search } from "iconoir-react";
import { useAtomValue } from "jotai";
import { isEqual } from "lodash-es";
import { CSSProperties, PropsWithChildren, forwardRef, memo } from "react";
import { NAVBAR_LINKS_ATOM, SEARCHBAR_PLACEMENT_ATOM, useColors, useOpenSearchDialog } from "../atoms";
import { FernLinkButton } from "../components/FernLinkButton";
import { SEARCH_BOX_MOUNTED } from "../search/algolia/SearchBox";
import { useSearchConfig } from "../services/useSearchService";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { ThemeButton } from "../themes";
import { getGitHubRepo } from "../util/github";
import { GitHubWidget } from "./GitHubWidget";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { MobileMenuButton } from "./MobileMenuButton";

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
    const navbarLinks = useAtomValue(NAVBAR_LINKS_ATOM);
    const colors = useColors();
    const openSearchDialog = useOpenSearchDialog();
    const isSearchBoxMounted = useAtomValue(SEARCH_BOX_MOUNTED);
    const [searchService] = useSearchConfig();
    const showSearchBar = useAtomValue(SEARCHBAR_PLACEMENT_ATOM) === "HEADER";

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
                                    <ArrowRight className="!size-icon transition-transform group-hover:translate-x-0.5" />
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
        <nav aria-label="primary" className={clsx("fern-header-content", className)} ref={ref} style={style}>
            <HeaderLogoSection />

            {showSearchBar && (
                <div
                    className={clsx("fern-header-searchbar", {
                        invisible: isSearchBoxMounted,
                    })}
                >
                    <SidebarSearchBar className="w-full" />
                </div>
            )}

            <div
                className={clsx("fern-header-right-menu", {
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
                            icon={<Search className="!size-icon-md" />}
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
