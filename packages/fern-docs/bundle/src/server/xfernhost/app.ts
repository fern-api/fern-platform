import { COOKIE_FERN_DOCS_PREVIEW, HEADER_X_FERN_HOST } from "@fern-docs/utils";
import { cookies, headers } from "next/headers";
import { getNextPublicDocsDomain } from "./dev";
import { getHostNodeStatic } from "./node";
import { cleanHost } from "./util";

export async function getDocsDomainApp(): Promise<Promise<string>> {
  const cookiesList = await cookies();
  const headersList = await headers();
  const hosts = [
    getNextPublicDocsDomain(),
    cookiesList.get(COOKIE_FERN_DOCS_PREVIEW)?.value,
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
export async function getHostApp(): Promise<string | undefined> {
  const headersList = await headers();
  // if x-fern-host is set, assume it's proxied:
  return (
    headersList.get(HEADER_X_FERN_HOST) ??
    headersList.get("host") ??
    getHostNodeStatic()
  );
}
