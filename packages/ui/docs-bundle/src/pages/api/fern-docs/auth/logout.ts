import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withDeleteCookie } from "@/server/auth/with-secure-cookie";
import { revokeSessionForToken } from "@/server/auth/workos-session";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_ACCESS_TOKEN, COOKIE_FERN_TOKEN, COOKIE_REFRESH_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const domain = getDocsDomainEdge(req);

    const authConfig = await getAuthEdgeConfig(domain);

    if (authConfig?.type === "sso" && authConfig.partner === "workos") {
        // revoke session in WorkOS
        await revokeSessionForToken(req.cookies.get(COOKIE_FERN_TOKEN)?.value);
    }

    const logoutUrl = safeUrl(authConfig?.type === "basic_token_verification" ? authConfig.logout : undefined);

    const return_to_param = getReturnToQueryParam(authConfig);

    // if logout url is provided, append the state to it before redirecting
    if (req.nextUrl.searchParams.has(return_to_param)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        logoutUrl?.searchParams.set(return_to_param, req.nextUrl.searchParams.get(return_to_param)!);
    }

    let redirectLocation =
        logoutUrl ??
        safeUrl(req.nextUrl.searchParams.get(return_to_param)) ??
        safeUrl(withDefaultProtocol(getHostEdge(req)));

    console.log("domain");
    console.log(domain);
    if (
        typeof redirectLocation !== "undefined" &&
        new URL(withDefaultProtocol(redirectLocation)).host !== new URL(withDefaultProtocol(domain)).host
    ) {
        // avoid malicious use of logout URL
        redirectLocation = new URL(withDefaultProtocol(domain));
    }

    const res = redirectLocation ? NextResponse.redirect(redirectLocation) : NextResponse.next();
    res.cookies.delete(withDeleteCookie(COOKIE_FERN_TOKEN, withDefaultProtocol(getHostEdge(req))));
    res.cookies.delete(withDeleteCookie(COOKIE_ACCESS_TOKEN, withDefaultProtocol(getHostEdge(req))));
    res.cookies.delete(withDeleteCookie(COOKIE_REFRESH_TOKEN, withDefaultProtocol(getHostEdge(req))));
    return res;
}
