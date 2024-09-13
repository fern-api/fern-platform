import {
    FernUser,
    OAuth2Client,
    OryAccessTokenSchema,
    getAuthEdgeConfig,
    getWorkOS,
    getWorkOSClientId,
    getXFernHostEdge,
    signFernJWT,
    withSecureCookie,
} from "@fern-ui/docs-server";
import { NextRequest, NextResponse } from "next/server";
import urlJoin from "url-join";

export const runtime = "edge";

function redirectWithLoginError(location: string, errorMessage: string): NextResponse {
    const url = new URL(location);
    url.searchParams.set("loginError", errorMessage);
    return NextResponse.redirect(url.toString());
}

export default async function GET(req: NextRequest): Promise<NextResponse> {
    // The authorization code returned by AuthKit
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const error_description = req.nextUrl.searchParams.get("error_description");
    const redirectLocation = state ?? req.nextUrl.origin;

    if (error != null) {
        return redirectWithLoginError(redirectLocation, error_description ?? error);
    }

    if (typeof code !== "string") {
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    const domain = getXFernHostEdge(req);
    const config = await getAuthEdgeConfig(domain);

    if (config != null && config.type === "oauth2" && config.partner === "ory") {
        const oauthClient = new OAuth2Client(config, urlJoin(`https://${domain}`, req.nextUrl.pathname));
        try {
            const { access_token, refresh_token } = await oauthClient.getToken(code);
            const token = OryAccessTokenSchema.parse(await oauthClient.decode(access_token));
            const fernUser: FernUser = {
                type: "user",
                partner: "ory",
                name: token.ext?.name,
                email: token.ext?.email,
            };
            const expires = token.exp == null ? undefined : new Date(token.exp * 1000);
            const res = NextResponse.redirect(redirectLocation);
            res.cookies.set("fern_token", await signFernJWT(fernUser), withSecureCookie({ expires }));
            res.cookies.set("access_token", access_token, withSecureCookie({ expires }));
            if (refresh_token != null) {
                res.cookies.set("refresh_token", refresh_token, withSecureCookie({ expires }));
            } else {
                res.cookies.delete("refresh_token");
            }
            return res;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
        }
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
        res.cookies.set("fern_token", token, withSecureCookie());
        return res;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
