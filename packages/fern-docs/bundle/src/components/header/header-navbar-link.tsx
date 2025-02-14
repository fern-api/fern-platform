import React from "react";

import { ArrowRight } from "lucide-react";

import { FaIconServer, cn } from "@fern-docs/components";

import { NavbarLink as NavbarLinkType } from "@/components/atoms";

import { FernLinkButton } from "../components/FernLinkButton";
import { GitHubWidget, getGitHubRepo } from "./GitHubWidget";
import { WithReturnTo } from "./return-to";

export function HeaderNavbarLink({
  navbarLink,
}: {
  navbarLink: NavbarLinkType;
}) {
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

  const link = (
    <FernLinkButton
      id={navbarLink.id}
      className={cn("group cursor-pointer", navbarLink.className)}
      href={navbarLink.href}
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
          navbarLink.rightIcon && <FaIconServer icon={navbarLink.rightIcon} />
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

  if (navbarLink.returnToQueryParam) {
    return (
      <WithReturnTo queryParam={navbarLink.returnToQueryParam}>
        {link}
      </WithReturnTo>
    );
  }

  return link;
}
