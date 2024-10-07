import { signFernJWT } from "@/server/auth/FernJWT";
import { getAuthEdgeConfig } from "@/server/auth/getAuthEdgeConfig";
import { withSecureCookie } from "@/server/auth/withSecure";
import { COOKIE_FERN_TOKEN } from "@/server/constants";
import { getWorkOS, getWorkOSClientId } from "@/server/workos";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { FernUser } from "@fern-ui/ui/auth";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function redirectWithLoginError(location: string, errorMessage: string): NextResponse {
    const url = new URL(location);
    url.searchParams.set("loginError", errorMessage);
    return NextResponse.redirect(url.toString());
}

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }
    const domain = getXFernHostEdge(req);

    // The authorization code returned by AuthKit
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const error_description = req.nextUrl.searchParams.get("error_description");
    const redirectLocation = state ?? `https://${domain}/`;

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
        // Permanent GET redirect to the Ory callback endpoint
        return NextResponse.redirect(nextUrl);
    }

    try {
        const { user } = await getWorkOS().userManagement.authenticateWithCode({
            code,
            clientId: getWorkOSClientId(),
        });

        const fernUser: FernUser = {
            type: "user",
            partner: "workos",
            name:
                user.firstName != null && user.lastName != null
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName ?? user.email.split("@")[0],
            email: user.email,
        };

        const token = await signFernJWT(fernUser, user);

        const res = NextResponse.redirect(redirectLocation);
        res.cookies.set(COOKIE_FERN_TOKEN, token, withSecureCookie());
        return res;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
