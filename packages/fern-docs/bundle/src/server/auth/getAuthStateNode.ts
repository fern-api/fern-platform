import { getAuthState } from "@fern-docs/auth";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN, withoutStaging } from "@fern-docs/utils";
import { NextApiRequest } from "next";
import { getDocsDomainNode, getHostNode } from "../xfernhost/node";
import { getOrgMetadataForDomain } from "./metadata-for-url";

/**
 * @param request - the request to check the headers / cookies
 * @param pathname - the pathname to check the auth config against.
 */
export async function getAuthStateNode(
  request: NextApiRequest,
  pathname?: string
): ReturnType<typeof getAuthState> {
  const domain = getDocsDomainNode(request);
  const host = getHostNode(request) ?? domain;
  const fern_token = request.cookies[COOKIE_FERN_TOKEN];
  const [authConfig, orgMetadata] = await Promise.all([
    getAuthEdgeConfig(domain),
    getOrgMetadataForDomain(withoutStaging(domain)),
  ]);
  return getAuthState({
    domain,
    host,
    fernToken: fern_token,
    pathname,
    authConfig,
    orgId: orgMetadata?.orgId,
    isPreview: orgMetadata?.isPreviewUrl,
  });
}
