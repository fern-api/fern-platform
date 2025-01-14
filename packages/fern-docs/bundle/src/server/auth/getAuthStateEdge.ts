import { getAuthState } from "@fern-docs/auth";
import {
  getAuthEdgeConfig,
  getPreviewUrlAuthConfig,
} from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN, withoutStaging } from "@fern-docs/utils";
import { NextRequest } from "next/server";
import { getDocsDomainEdge, getHostEdge } from "../xfernhost/edge";
import { getOrgMetadataForDomain } from "./metadata-for-url";

/**
 * @param request - the request to check the headers / cookies
 * @param pathname - the pathname to check the auth config against. The pathname MUST be provided in the middleware.
 */
export async function getAuthStateEdge(
  request: NextRequest,
  pathname?: string,
  setFernToken?: (token: string) => void
): ReturnType<typeof getAuthState> {
  const domain = getDocsDomainEdge(request);
  const host = getHostEdge(request);
  const fern_token = request.cookies.get(COOKIE_FERN_TOKEN)?.value;
  const [authConfig, previewAuthConfig] = await Promise.all([
    getAuthEdgeConfig(domain),
    getOrgMetadataForDomain(withoutStaging(domain)).then((metadata) =>
      metadata ? getPreviewUrlAuthConfig(metadata) : undefined
    ),
  ]);
  return getAuthState({
    domain,
    host,
    fernToken: fern_token,
    pathname,
    setFernToken,
    authConfig,
    previewAuthConfig,
  });
}
