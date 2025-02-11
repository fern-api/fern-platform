"use client";

import { ReactElement, memo } from "react";

import clsx from "clsx";
import { useAtomValue } from "jotai";

import {
  DISABLE_SIDEBAR_ATOM,
  type NavbarLink,
  SIDEBAR_DISMISSABLE_ATOM,
} from "../atoms";
import { DismissableSidebar } from "./DismissableSidebar";
import { SidebarContainer } from "./SidebarContainer";

export const Sidebar = memo(function Sidebar({
  className,
  logo,
  versionSelect,
  navbarLinks,
  children,
}: {
  className?: string;
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  navbarLinks: NavbarLink[];
  children: React.ReactNode;
}): ReactElement<any> | null {
  const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);
  const disableSidebar = useAtomValue(DISABLE_SIDEBAR_ATOM);

  if (disableSidebar) {
    return null;
  }

  return showDismissableSidebar ? (
    <DismissableSidebar
      className={className}
      logo={logo}
      versionSelect={versionSelect}
      navbarLinks={navbarLinks}
    >
      {children}
    </DismissableSidebar>
  ) : (
    <SidebarContainer
      className={clsx("desktop", className)}
      logo={logo}
      versionSelect={versionSelect}
      navbarLinks={navbarLinks}
    >
      {children}
    </SidebarContainer>
  );
});
