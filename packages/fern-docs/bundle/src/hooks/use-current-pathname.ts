import { usePathname } from "next/navigation";

import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { conformExplorerRoute } from "../components/playground/utils/explorer-route";

export function useCurrentPathname() {
  const pathname = usePathname();
  if (typeof window === "undefined") {
    return parseServerSidePathname(pathname);
  }
  return pathname;
}

export function useCurrentSlug() {
  const pathname = useCurrentPathname();
  // removes the special `/~` route from the pathname
  return slugjoin(pathname.replace(/\/~.*$/, ""));
}

// the middleware will rewrite the pathname to the following format: /[host]/[domain]/[type]/[pathname]/[[...catchall]]
// this function reverse that operation on the server side
export function parseServerSidePathname(pathname: string) {
  const [, _host, _domain, type, innerPathname] = pathname.split("/");
  if (!innerPathname?.startsWith("%2F")) {
    return pathname;
  }
  const decodedInnerPathname = decodeURIComponent(innerPathname);
  if (type === "explorer") {
    return conformExplorerRoute(decodedInnerPathname);
  }
  return decodedInnerPathname;
}
