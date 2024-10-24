import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest } from "next/server";
import { getDocsDomainEdge } from "../xfernhost/edge";
import { AuthState, getAuthState } from "./getAuthState";

/**
 * @param request - the request to check the headers / cookies
 * @param pathname - the pathname to check the auth config against. The pathname MUST be provided in the middleware.
 */
export async function getAuthStateEdge(request: NextRequest, pathname?: string): Promise<AuthState> {
    const xFernHost = getDocsDomainEdge(request);
    const fernToken = request.cookies.get(COOKIE_FERN_TOKEN)?.value;
    return getAuthState(xFernHost, fernToken, pathname);
}
