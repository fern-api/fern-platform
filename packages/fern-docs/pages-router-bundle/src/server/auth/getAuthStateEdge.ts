import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { NextRequest } from "next/server";
import { getDocsDomainEdge, getHostEdge } from "../xfernhost/edge";
import { getAuthState } from "./getAuthState";

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
  return getAuthState(
    domain,
    host,
    fern_token,
    pathname,
    undefined,
    setFernToken
  );
}
