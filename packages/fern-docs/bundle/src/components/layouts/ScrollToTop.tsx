"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { isExplorerRoute } from "../playground/utils/explorer-route";
import { scrollToRoute } from "../util/anchor";

export function ScrollToTop() {
  const pathname = usePathname();
  React.useEffect(() => {
    if (isExplorerRoute(pathname)) {
      // don't scroll to top if the route is actually the same (minus the explorer route)
      return;
    }

    if (!scrollToRoute(`${pathname}${window.location.hash}`)) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}
