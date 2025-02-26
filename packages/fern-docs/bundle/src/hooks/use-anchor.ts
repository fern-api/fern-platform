import React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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
