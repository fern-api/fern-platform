import React from "react";

import { useIsomorphicLayoutEffect } from "@fern-ui/react-commons";

export function useCurrentAnchor() {
  const [anchor, setAnchor] = React.useState<string>("");

  useIsomorphicLayoutEffect(() => {
    const handleHashChange = () => {
      setAnchor(window.location.hash.slice(1));
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("popstate", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("popstate", handleHashChange);
    };
  }, []);

  return anchor;
}
