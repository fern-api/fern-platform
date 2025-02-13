import { ReactElement } from "react";

import cn from "clsx";
import { ArrowRight } from "iconoir-react";
import { useAtomValue } from "jotai";

import { MOBILE_SIDEBAR_ENABLED_ATOM, type NavbarLink } from "../atoms";
import { FernLinkButton } from "../components/FernLinkButton";

export function MobileSidebarHeaderLinks({
  navbarLinks,
}: {
  navbarLinks: NavbarLink[];
}): ReactElement<any> | null {
  const isMobileSidebarEnabled = useAtomValue(MOBILE_SIDEBAR_ENABLED_ATOM);
  if (navbarLinks == null || navbarLinks.length === 0) {
    return null;
  }
  return (
    <div
      className={cn("border-concealed -mx-4 mt-4 list-none border-t p-4", {
        "lg:hidden": true,
      })}
    >
      {navbarLinks?.map((navbarLink, idx) =>
        // TODO: Implement GitHub link
        navbarLink.type === "github" ? null : (
          <FernLinkButton
            key={idx}
            icon={navbarLink.icon}
            href={navbarLink.href}
            text={navbarLink.text}
            rightIcon={
              navbarLink.rightIcon ??
              (navbarLink.type === "primary" ||
              (navbarLink.type === "filled" &&
                idx === navbarLinks.length - 1) ? (
                <ArrowRight className="!size-icon" />
              ) : undefined)
            }
            id={navbarLink.id}
            className={cn(
              "w-full",
              {
                "mt-2":
                  navbarLink.type === "primary" || navbarLink.type === "filled",
              },
              navbarLink.className
            )}
            variant={
              navbarLink.type === "primary"
                ? "outlined"
                : navbarLink.type === "secondary"
                  ? "minimal"
                  : navbarLink.type
            }
            intent={
              navbarLink.type === "primary" || navbarLink.type === "filled"
                ? "primary"
                : "none"
            }
            size={isMobileSidebarEnabled ? "large" : "normal"}
          />
        )
      )}
    </div>
  );
}
