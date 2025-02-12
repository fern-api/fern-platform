"use client";

import { ReactElement } from "react";

import { type NavbarLink } from "../atoms";
import { SidebarContainer } from "./SidebarContainer";
import { SidebarRootNode } from "./nodes/SidebarRootNode";

export function Sidebar({
  logo,
  versionSelect,
  navbarLinks,
}: {
  className?: string;
  logo: React.ReactNode;
  versionSelect: React.ReactNode;
  navbarLinks: NavbarLink[];
}): ReactElement<any> | null {
  // const showDismissableSidebar = useAtomValue(SIDEBAR_DISMISSABLE_ATOM);
  // const disableSidebar = useAtomValue(DISABLE_SIDEBAR_ATOM);

  // if (disableSidebar) {
  //   return null;
  // }

  return (
    <SidebarContainer
      logo={logo}
      versionSelect={versionSelect}
      navbarLinks={navbarLinks}
    >
      <SidebarRootNode />
    </SidebarContainer>
  );
}
