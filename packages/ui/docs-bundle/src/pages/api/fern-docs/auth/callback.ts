// eslint-disable-next-line import/no-internal-modules
import { FernUser, OryAccessTokenSchema, getOAuthEdgeConfig, getOAuthToken, signFernJWT } from "@fern-ui/ui/auth";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import urlJoin from "url-join";
import { getWorkOS, getWorkOSClientId } from "../../../../utils/auth";
import { getXFernHostEdge } from "../../../../utils/xFernHost";
// export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
//     // The authorization code returned by AuthKit
//     const code = req.query.code as string;

//     const { user } = await getWorkOS().userManagement.authenticateWithCode({
//         code,
//         clientId: getWorkOSClientId(),
//     });

//     // Create a JWT token with the user's information
//     const token = await new SignJWT({
//         // Here you might lookup and retrieve user details from your database
//         user,
//     })
//         .setProtectedHeader({ alg: "HS256", typ: "JWT" })
//         .setIssuedAt()
//         .setExpirationTime("30d")
//         .setIssuer("https://buildwithfern.com")
//         .sign(getJwtTokenSecret());

//     res.setHeader("Set-Cookie", `fern_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`);

//     res.redirect("/");
// };

export const runtime = "edge";

function redirectWithLoginError(location: string, errorMessage: string): NextResponse {
    const url = new URL(location);
    url.searchParams.append("loginError", errorMessage);
    return NextResponse.redirect(url.toString());
}

const COOKIE_OPTS = {
    secure: true,
    httpOnly: true,
    sameSite: true,
};

export default async function GET(req: NextRequest): Promise<NextResponse> {
    // The authorization code returned by AuthKit
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const redirectLocation = state ?? req.nextUrl.origin;

    if (typeof code !== "string") {
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    const domain = getXFernHostEdge(req);
    const config = await getOAuthEdgeConfig(domain);

    const cookieJar = cookies();

    if (config != null && config.partner === "ory") {
        try {
            const { access_token, refresh_token } = await getOAuthToken(
                config,
                code,
                urlJoin(`https://${domain}`, req.nextUrl.pathname),
            );

            const token = OryAccessTokenSchema.parse(decodeJwt(access_token));
            const fernUser: FernUser = {
                type: "user",
                partner: "ory",
                name: token.ext.name,
                email: token.ext.email,
            };
            cookieJar.set("fern_token", await signFernJWT(fernUser), COOKIE_OPTS);
            cookieJar.set("access_token", access_token, COOKIE_OPTS);
            cookieJar.set("refresh_token", refresh_token, COOKIE_OPTS);
            return NextResponse.redirect(redirectLocation);
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

        const token = await signFernJWT(fernUser);
        cookieJar.set("fern_token", token, COOKIE_OPTS);

        return NextResponse.redirect(redirectLocation);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
