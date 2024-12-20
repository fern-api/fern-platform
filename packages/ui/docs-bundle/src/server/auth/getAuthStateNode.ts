import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextApiRequest } from "next";
import { getDocsDomainNode, getHostNode } from "../xfernhost/node";
import { getAuthState } from "./getAuthState";

/**
 * @param request - the request to check the headers / cookies
 * @param pathname - the pathname to check the auth config against.
 */
export async function getAuthStateNode(request: NextApiRequest, pathname?: string): ReturnType<typeof getAuthState> {
    const domain = getDocsDomainNode(request);
    const host = getHostNode(request) ?? domain;
    const fern_token = request.cookies[COOKIE_FERN_TOKEN];
    return getAuthState(domain, host, fern_token, pathname);
}
