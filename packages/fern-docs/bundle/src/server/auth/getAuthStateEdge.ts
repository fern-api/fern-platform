import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { NextRequest } from "next/server";
import { getDocsDomainEdge, getHostEdge } from "../xfernhost/edge";
import { createGetAuthState } from "./getAuthState";

/**
 * @param request - the request to check the headers / cookies
 * @param pathname - the pathname to check the auth config against. The pathname MUST be provided in the middleware.
 */
export async function createGetAuthStateEdge(
  request: NextRequest,
  setFernToken?: (token: string) => void
): ReturnType<typeof createGetAuthState> {
  const domain = getDocsDomainEdge(request);
  const host = getHostEdge(request);
  const fern_token = request.cookies.get(COOKIE_FERN_TOKEN)?.value;
  return createGetAuthState(domain, host, fern_token, undefined, setFernToken);
}
