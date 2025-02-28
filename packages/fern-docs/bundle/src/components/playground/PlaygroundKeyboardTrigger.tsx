"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { removeTrailingSlash } from "@fern-docs/utils";

export function PlaygroundKeyboardTrigger() {
  const pathname = removeTrailingSlash(usePathname());
  const router = useRouter();
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl + ` (backtick)
      if (e.ctrlKey && e.key === "`") {
        e.preventDefault();
        router.replace(
          pathname.endsWith("/~explorer")
            ? pathname.slice(0, -10)
            : `${pathname}/~explorer`
        );
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname, router]);

  return null;
}
