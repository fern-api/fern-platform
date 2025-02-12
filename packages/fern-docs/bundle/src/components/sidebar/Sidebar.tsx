"use client";

import { ReactElement } from "react";

import { useAtomValue } from "jotai";

import { DISABLE_SIDEBAR_ATOM, type NavbarLink } from "../atoms";
import { SidebarContainer } from "./SidebarContainer";

export function Sidebar({
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
  // const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);
  const disableSidebar = useAtomValue(DISABLE_SIDEBAR_ATOM);

  if (disableSidebar) {
    return null;
  }

  return (
    <SidebarContainer
      logo={logo}
      versionSelect={versionSelect}
      navbarLinks={navbarLinks}
    >
      {children}
    </SidebarContainer>
  );
}
