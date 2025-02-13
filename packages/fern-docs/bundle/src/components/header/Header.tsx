"use client";

import { usePathname } from "next/navigation";
import { CSSProperties, useState } from "react";
import React from "react";

import cn, { clsx } from "clsx";
import { ArrowRight } from "iconoir-react";

import { FernButtonGroup } from "@fern-docs/components";

import { SearchV2Trigger } from "@/state/search";

import type { NavbarLink } from "../atoms/types";
import { FernLinkButton } from "../components/FernLinkButton";
import { ThemeButton } from "../themes";
import { getGitHubRepo } from "../util/github";
import { GitHubWidget } from "./GitHubWidget";
import { HeaderLogoSection } from "./HeaderLogoSection";

export declare namespace Header {
  export interface Props {
    logo: React.ReactNode;
    versionSelect: React.ReactNode;
    className?: string;
    style?: CSSProperties;
    showThemeButton?: boolean;
    showSearchBar?: boolean;
    navbarLinks: NavbarLink[];
  }
}

export function Header({
  logo,
  versionSelect,
  className,
  style,
  showThemeButton,
  showSearchBar,
  navbarLinks,
}: Header.Props) {
  return (
    <div
      className={cn(
        "flex w-full items-center justify-stretch gap-4 px-4 md:px-6 lg:px-8",
        className
      )}
      style={style}
    >
      <HeaderLogoSection logo={logo} versionSelect={versionSelect} />

      {showSearchBar && (
        <SearchV2Trigger
          aria-label="Search"
          className="max-w-content-width mx-2 hidden w-full min-w-0 shrink lg:inline-flex"
        />
      )}

      <FernButtonGroup asChild>
        <nav
          aria-label="Navbar links"
          className="hidden flex-1 lg:flex lg:items-center lg:justify-end"
        >
          {navbarLinks.map((navbarLink, idx) => (
            <NavbarLink key={idx} navbarLink={navbarLink} />
          ))}

          {showThemeButton && <ThemeButton />}
        </nav>
      </FernButtonGroup>
    </div>
  );
}

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
