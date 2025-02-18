import React from "react";

export function useCurrentAnchor() {
  const [anchor, setAnchor] = React.useState<string>("");

  React.useEffect(() => {
    const handleHashChange = () => {
      setAnchor(window.location.hash.slice(1));
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return anchor;
}
