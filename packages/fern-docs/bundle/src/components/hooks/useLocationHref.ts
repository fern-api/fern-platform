/* eslint-disable react-hooks/rules-of-hooks */
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";

import { useCurrentPathname } from "@/hooks/use-current-pathname";
import { useDomain } from "@/state/domain";

function useServerSideLocationHref() {
  const domain = useDomain();
  const pathname = useCurrentPathname();
  const searchParams = String(useSearchParams());
  // TODO: this matches the current pages router pattern (/static/[domain]/[[...slug]]) but will need to be update for app router
  return withDefaultProtocol(
    `${domain}/${pathname.split("/").slice(2).join("/")}?${searchParams}`
  );
}

/**
 * Isomorphically get the current href location
 * @param hydrationSafe - if true, will return the current location even if the page is not ready
 * @returns the current href location
 */
export function useLocationHref(hydrationSafe = false) {
  // isomorphically get the current href location
  if (typeof window === "undefined") {
    return useServerSideLocationHref();
  }

  const [locationHref, setLocationHref] = useState(
    hydrationSafe ? window.location.href.split("#")[0] : window.location.href
  );

  const pathname = useCurrentPathname();
  const searchParams = useSearchParams();
  useEffect(() => {
    setLocationHref(window.location.href);
  }, [pathname, searchParams]);

  return locationHref;
}
