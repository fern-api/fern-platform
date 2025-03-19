import { usePathname, useSearchParams } from "next/navigation";
import React from "react";

import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

export function useCurrentAnchor() {
  const [anchor, setAnchor] = React.useState<string>("");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // hack: searchParams creates a new record when anchor is added
  // this could break if nextjs checks for equality upstream
  useIsomorphicLayoutEffect(() => {
    const hash = window.location.hash.slice(1);
    setAnchor(hash);
  }, [pathname, searchParams]);

  return anchor;
}
