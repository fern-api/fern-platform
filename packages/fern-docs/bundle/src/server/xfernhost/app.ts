import { headers } from "next/headers";

import { HEADER_X_FERN_HOST } from "@fern-docs/utils";

import { getNextPublicDocsDomain } from "./dev";
import { cleanHost } from "./util";

export async function getDocsDomainApp(): Promise<string> {
  const headersList = await headers();
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

export async function getDocsHostApp(): Promise<string> {
  const headersList = await headers();
  return headersList.get("host") ?? (await getDocsDomainApp());
}
