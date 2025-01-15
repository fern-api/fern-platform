import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernButtonGroup } from "@fern-docs/components";
import cn, { clsx } from "clsx";
import { isEqual } from "es-toolkit/predicate";
import { ArrowRight, Search } from "iconoir-react";
import { useAtomValue } from "jotai";
import { CSSProperties, PropsWithChildren, forwardRef, memo } from "react";
import {
  NAVBAR_LINKS_ATOM,
  SEARCHBAR_PLACEMENT_ATOM,
  useColors,
  useOpenSearchDialog,
} from "../atoms";
import { FernLinkButton } from "../components/FernLinkButton";
import { SEARCH_BOX_MOUNTED } from "../search/algolia/SearchBox";
import { useSearchConfig } from "../services/useSearchService";
import { SidebarSearchBar } from "../sidebar/SidebarSearchBar";
import { ThemeButton } from "../themes";
import { getGitHubRepo } from "../util/github";
import { GitHubWidget } from "./GitHubWidget";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { MobileMenuButton } from "./MobileMenuButton";
import { ProductDropdown } from "./ProductDropdown";
import { VersionDropdown } from "./VersionDropdown";

export declare namespace Header {
  export interface Props {
    className?: string;
    style?: CSSProperties;
  }
}

const UnmemoizedHeader = forwardRef<
  HTMLDivElement,
  PropsWithChildren<Header.Props>
>(function Header({ className, style }, ref) {
  const navbarLinks = useAtomValue(NAVBAR_LINKS_ATOM);
  const colors = useColors();
  const openSearchDialog = useOpenSearchDialog();
  const isSearchBoxMounted = useAtomValue(SEARCH_BOX_MOUNTED);
  const searchService = useSearchConfig();
  const showSearchBar = useAtomValue(SEARCHBAR_PLACEMENT_ATOM) === "HEADER";

  const navbarLinksSection = (
    <div className="lg-menu">
      <FernButtonGroup>
        {navbarLinks.map((navbarLink, idx) => {
          if (navbarLink.type === "github") {
            const repo = getGitHubRepo(navbarLink.href);
            return (
              repo && (
                <GitHubWidget
                  key={idx}
                  repo={repo}
                  className={navbarLink.className}
                  id={navbarLink.id}
                />
              )
            );
          }

          return (
            <FernLinkButton
              key={idx}
              id={navbarLink.id}
              className={clsx("group cursor-pointer", navbarLink.className)}
              href={navbarLink.href}
              icon={navbarLink.icon}
              intent={
                navbarLink.type === "primary" || navbarLink.type === "filled"
                  ? "primary"
                  : "none"
              }
              rightIcon={
                navbarLink.rightIcon ??
                (navbarLink.type === "primary" ||
                (navbarLink.type === "filled" &&
                  idx === navbarLinks.length - 1) ? (
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
  const githubRepo = githubLink && getGitHubRepo(githubLink.href);

  return (
    <header className="z-header h-header border-divider bg-background sticky top-0 flex flex-col border-b">
      <div className="flex h-[var(--header-content-height)] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
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
        </div>

        <div className="flex items-center gap-2">
          <ProductDropdown />
          <VersionDropdown />

          <div className="max-lg-menu">
            {githubRepo && (
              <GitHubWidget
                repo={githubRepo}
                className={githubLink?.className}
                id={githubLink?.id}
              />
            )}

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
                id="fern-search-button"
              />
            )}

            <MobileMenuButton />
          </div>
        </div>
      </div>
    </header>
  );
});

export const Header = memo(
  UnmemoizedHeader,
  (prev, next) =>
    prev.className === next.className && isEqual(prev.style, next.style)
);

export declare namespace HeaderPrimaryLink {
  export interface Props {
    navbarLink: DocsV1Read.NavbarLink.Primary;
  }
}
