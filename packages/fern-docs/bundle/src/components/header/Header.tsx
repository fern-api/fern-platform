import { CSSProperties, PropsWithChildren, forwardRef, memo } from "react";

import cn, { clsx } from "clsx";
import { isEqual } from "es-toolkit/predicate";
import { ArrowRight, Search } from "iconoir-react";
import { useAtomValue } from "jotai";

import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernButtonGroup } from "@fern-docs/components";

import { SearchV2Trigger } from "@/components/search-trigger";

import {
  NAVBAR_LINKS_ATOM,
  SEARCHBAR_PLACEMENT_ATOM,
  useColors,
  useOpenSearchDialog,
} from "../atoms";
import { FernLinkButton } from "../components/FernLinkButton";
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

const UnmemoizedHeader = forwardRef<
  HTMLDivElement,
  PropsWithChildren<Header.Props>
>(function Header({ className, style }, ref) {
  const navbarLinks = useAtomValue(NAVBAR_LINKS_ATOM);
  const colors = useColors();
  const openSearchDialog = useOpenSearchDialog();
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
    <nav
      aria-label="primary"
      className={cn("fern-header-content", className)}
      ref={ref}
      style={style}
    >
      <HeaderLogoSection />

      {showSearchBar && (
        <div className={cn("fern-header-searchbar")}>
          <SearchV2Trigger />
        </div>
      )}

      <div
        className={cn("fern-header-right-menu", {
          "flex-1": showSearchBar,
        })}
      >
        {navbarLinksSection}

        <div className="max-lg-menu">
          {githubRepo && (
            <GitHubWidget
              repo={githubRepo}
              className={githubLink?.className}
              id={githubLink?.id}
            />
          )}

          {colors.dark && colors.light && <ThemeButton size="large" />}

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

          <MobileMenuButton />
        </div>
      </div>
    </nav>
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
