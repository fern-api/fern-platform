import { signFernJWT } from "@/server/auth/FernJWT";
import { withSecureCookie } from "@/server/auth/withSecure";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getWorkOS, getWorkOSClientId } from "@/server/workos";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernUser } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_FERN_TOKEN, HEADER_X_FERN_HOST } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }
    const domain = getDocsDomainEdge(req);

    // The authorization code returned by AuthKit
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const error_description = req.nextUrl.searchParams.get("error_description");
    const redirectLocation = safeUrl(state) ?? safeUrl(withDefaultProtocol(getHostEdge(req)));

    if (error != null) {
        return redirectWithLoginError(redirectLocation, error_description ?? error);
    }

    if (typeof code !== "string") {
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    const config = await getAuthEdgeConfig(domain);

    if (config != null && config.type === "oauth2" && config.partner === "ory") {
        const nextUrl = req.nextUrl.clone();
        nextUrl.pathname = nextUrl.pathname.replace(
            "/api/fern-docs/auth/callback",
            "/api/fern-docs/oauth/ory/callback",
        );

        // Redirect to x-fern-host domain if it exists
        // this is to ensure proxied origins are used for the redirect
        if (req.headers.has(HEADER_X_FERN_HOST)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            nextUrl.host = req.headers.get(HEADER_X_FERN_HOST)!;
        }

        // TODO: validate allowlist of domains to prevent open redirects
        return NextResponse.redirect(nextUrl);
    }

    try {
        const { user } = await getWorkOS().userManagement.authenticateWithCode({
            code,
            clientId: getWorkOSClientId(),
        });

        const fernUser: FernUser = {
            name:
                user.firstName != null && user.lastName != null
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName ?? user.email.split("@")[0],
            email: user.email,
        };

        const token = await signFernJWT(fernUser, user);

        // TODO: validate allowlist of domains to prevent open redirects
        const res = redirectLocation ? NextResponse.redirect(redirectLocation) : NextResponse.next();
        res.cookies.set(COOKIE_FERN_TOKEN, token, withSecureCookie());
        return res;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
