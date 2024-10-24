import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextApiRequest } from "next";
import { getDocsDomainNode } from "../xfernhost/node";
import { AuthState, getAuthState } from "./getAuthState";

/**
 * @param request - the request to check the headers / cookies
 * @param pathname - the pathname to check the auth config against.
 */
export async function getAuthStateNode(request: NextApiRequest, pathname?: string): Promise<AuthState> {
    const xFernHost = getDocsDomainNode(request);
    const fernToken = request.cookies[COOKIE_FERN_TOKEN];
    return getAuthState(xFernHost, fernToken, pathname);
}
