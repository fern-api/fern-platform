import React from "react";

import { ArrowRight } from "lucide-react";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { cn } from "@fern-docs/components";
import { isTrailingSlashEnabled } from "@fern-docs/utils";

import type {
  NavbarLink,
  NavbarLink as NavbarLinkType,
} from "@/components/atoms";
import { FaIconServer } from "@/components/fa-icon-server";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { DocsLoader } from "@/server/docs-loader";

import { FernLinkButton } from "../components/FernLinkButton";
import { getApiRouteSupplier } from "../util/getApiRouteSupplier";
import { GitHubWidget, getGitHubRepo } from "./GitHubWidget";
import { WithReturnTo } from "./WithReturnTo";

export async function NavbarLinks({ loader }: { loader: DocsLoader }) {
  const [{ basePath }, config, authConfig, authState] = await Promise.all([
    loader.getBaseUrl(),
    loader.getConfig(),
    loader.getAuthConfig(),
    loader.getAuthState(),
  ]);

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

  // HACKHACK: This is a hack to add a login button to the navbar if the user is not authenticated
  if (authConfig?.type === "basic_token_verification" && !authState.authed) {
    navbarLinks.push({
      type: "outlined",
      text: "Login",
      href: withDefaultProtocol(authConfig.redirect),
      icon: undefined,
      rightIcon: undefined,
      rounded: false,
      className: undefined,
      id: "fern-docs-login-button",
      returnToQueryParam: getReturnToQueryParam(authConfig),
    });
  }

  const getApiRoute = getApiRouteSupplier({
    basepath: basePath,
    includeTrailingSlash: isTrailingSlashEnabled(),
  });

  if (authState.authed) {
    navbarLinks.push({
      type: "outlined",
      text: "Logout",
      href: getApiRoute("/api/fern-docs/auth/logout"),
      icon: undefined,
      rightIcon: undefined,
      rounded: false,
      className: undefined,
      id: "fern-docs-logout-button",
      returnToQueryParam: getReturnToQueryParam(authConfig),
    });
  }
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
