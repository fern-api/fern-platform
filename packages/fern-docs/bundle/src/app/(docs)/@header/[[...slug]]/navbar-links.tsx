"use client";

import { NavbarLink } from "@/components/atoms";
import { FernLinkButton } from "@/components/components/FernLinkButton";
import { GitHubWidget } from "@/components/header/GitHubWidget";
import { MobileMenuButton } from "@/components/header/MobileMenuButton";
import { ThemeButton } from "@/components/themes";
import { getGitHubRepo } from "@/components/util/github";
import { FernButtonGroup } from "@fern-docs/components";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";

export function NavbarLinks({
  links,
  showThemeButton,
}: {
  links: NavbarLink[];
  showThemeButton: boolean;
}) {
  return (
    <FernButtonGroup>
      {links.map((navbarLink, idx) => {
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
              (navbarLink.type === "filled" && idx === links.length - 1) ? (
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

      {showThemeButton && <ThemeButton />}
      <MobileMenuButton />
    </FernButtonGroup>
  );
}
