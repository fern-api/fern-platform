"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { scrollToRoute } from "../util/anchor";

export function ScrollToTop() {
  const pathname = usePathname();
  React.useEffect(() => {
    if (!scrollToRoute(`${pathname}${window.location.hash}`)) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}
