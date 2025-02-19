import React from "react";

import { ArrowRight } from "lucide-react";

import { cn } from "@fern-docs/components";

import type {
  NavbarLink,
  NavbarLink as NavbarLinkType,
} from "@/components/atoms";
import { FaIconServer } from "@/components/fa-icon-server";
import { DocsLoader } from "@/server/docs-loader";

import { FernLinkButton } from "../components/FernLinkButton";
import { GitHubWidget, getGitHubRepo } from "./GitHubWidget";
import { WithReturnTo } from "./WithReturnTo";

export async function NavbarLinks({ loader }: { loader: DocsLoader }) {
  const config = await loader.getConfig();

  const navbarLinks: NavbarLink[] = [];

  config.navbarLinks?.forEach((link) => {
    if (link.type === "github") {
      navbarLinks.push({
        type: "github",
        href: link.url,
        className: undefined,
        id: undefined,
      });
    } else {
      navbarLinks.push({
        type: link.type,
        href: link.url,
        text: link.text,
        icon: link.icon,
        rightIcon: link.rightIcon,
        rounded: link.rounded,
        className: undefined,
        id: undefined,
        returnToQueryParam: undefined,
      });
    }
  });

  return (
    <>
      {navbarLinks.map((navbarLink, idx) => (
        <HeaderNavbarLink key={navbarLink.id ?? idx} navbarLink={navbarLink} />
      ))}
    </>
  );
}

function HeaderNavbarLink({ navbarLink }: { navbarLink: NavbarLinkType }) {
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
      icon={navbarLink.icon && <FaIconServer icon={navbarLink.icon} />}
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
