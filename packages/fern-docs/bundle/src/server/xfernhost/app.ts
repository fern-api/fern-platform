import { HEADER_X_FERN_HOST } from "@fern-docs/utils";
import { cookies, headers } from "next/headers";
import { getNextPublicDocsDomain } from "./dev";
import { getHostNodeStatic } from "./node";
import { cleanHost } from "./util";

export function getDocsDomainApp(): string {
  const cookiesList = cookies();
  const headersList = headers();
  const hosts = [
    getNextPublicDocsDomain(),
    headersList.get(HEADER_X_FERN_HOST),
    headersList.get("host"),
  ];

  for (let host of hosts) {
    host = cleanHost(host);
    if (host != null) {
      return host;
    }
  }

  console.error(
    "Could not determine xFernHost from request. Returning buildwithfern.com."
  );
  return "buildwithfern.com";
}

// use this for testing auth-based redirects on development and preview environments
export function getHostApp(): string | undefined {
  const headersList = headers();
  // if x-fern-host is set, assume it's proxied:
  return (
    headersList.get(HEADER_X_FERN_HOST) ??
    headersList.get("host") ??
    getHostNodeStatic()
  );
}
