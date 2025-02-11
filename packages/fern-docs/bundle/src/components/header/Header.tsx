"use client";

import { usePathname } from "next/navigation";
import { CSSProperties, PropsWithChildren, useState } from "react";
import React from "react";

import cn, { clsx } from "clsx";
import { ArrowRight, Search } from "iconoir-react";

import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernButton, FernButtonGroup } from "@fern-docs/components";

import { ColorsThemeConfig } from "@/server/types";
import { SearchV2Trigger, useToggleSearchDialog } from "@/state/search";

import type { NavbarLink } from "../atoms/types";
import { FernLinkButton } from "../components/FernLinkButton";
import { ThemeButton } from "../themes";
import { getGitHubRepo } from "../util/github";
import { GitHubWidget } from "./GitHubWidget";
import { HeaderLogoSection } from "./HeaderLogoSection";
import { MobileMenuButton } from "./MobileMenuButton";

export declare namespace Header {
  export interface Props {
    logo: React.ReactNode;
    versionSelect: React.ReactNode;
    className?: string;
    style?: CSSProperties;
    colors: {
      light?: ColorsThemeConfig;
      dark?: ColorsThemeConfig;
    };
    showSearchBar?: boolean;
    navbarLinks: NavbarLink[];
  }
}

export const Header = React.memo(
  React.forwardRef<HTMLDivElement, PropsWithChildren<Header.Props>>(
    function Header(
      {
        logo,
        versionSelect,
        className,
        style,
        colors,
        showSearchBar,
        navbarLinks,
      },
      ref
    ) {
      const toggleSearchDialog = useToggleSearchDialog();

      const navbarLinksSection = (
        <div className="lg-menu">
          <FernButtonGroup>
            {navbarLinks.map((navbarLink, idx) => (
              <NavbarLink key={idx} navbarLink={navbarLink} />
            ))}

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
          <HeaderLogoSection logo={logo} versionSelect={versionSelect} />

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
                  toggleSearchDialog();
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
    }
  )
);

function NavbarLink({ navbarLink }: { navbarLink: NavbarLink }) {
  const [href, setHref] = useState(() => navbarLink.href);

  const pathname = usePathname();

  React.useEffect(() => {
    if (navbarLink.type === "github" || !navbarLink.returnToQueryParam) {
      return;
    }
    try {
      const url = new URL(navbarLink.href, window.location.origin);
      url.searchParams.set(
        navbarLink.returnToQueryParam,
        String(new URL(pathname, window.location.origin))
      );
      setHref(url.toString());
    } catch {}
  }, [navbarLink.type, navbarLink, pathname]);

  if (navbarLink.type === "github") {
    const repo = getGitHubRepo(navbarLink.href);
    return (
      repo && (
        <GitHubWidget
          repo={repo}
          className={navbarLink.className}
          id={navbarLink.id}
        />
      )
    );
  }

  return (
    <FernLinkButton
      id={navbarLink.id}
      className={clsx("group cursor-pointer", navbarLink.className)}
      href={href}
      icon={navbarLink.icon}
      intent={
        navbarLink.type === "primary" || navbarLink.type === "filled"
          ? "primary"
          : "none"
      }
      rightIcon={
        navbarLink.rightIcon === "arrow-right" ? (
          <ArrowRight className="!size-icon transition-transform group-hover:translate-x-0.5" />
        ) : (
          navbarLink.rightIcon
        )
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
}

export declare namespace HeaderPrimaryLink {
  export interface Props {
    navbarLink: DocsV1Read.NavbarLink.Primary;
  }
}
