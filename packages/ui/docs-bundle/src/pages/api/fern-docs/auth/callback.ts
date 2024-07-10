import { PartnerLogin } from "@fern-ui/ui";
import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { getJwtTokenSecret, getWorkOS, getWorkOSClientId } from "../../../../utils/auth";
import { notFoundResponse, redirectResponse } from "../../../../utils/serverResponse";
import { getPartnerLoginConfig } from "../partner-login";
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

function redirectWithLoginError(originalURL: string | null, errorMessage: string): NextResponse {
    if (originalURL == null) {
        return redirectResponse("/?loginError=" + errorMessage);
    }

    const url = new URL(originalURL);
    url.searchParams.append("loginError", errorMessage);
    return redirectResponse(url.toString());
}

export default async function GET(req: NextRequest): Promise<NextResponse> {
    // The authorization code returned by AuthKit
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    if (typeof code !== "string") {
        return notFoundResponse();
    }
    let token;

    if (req.nextUrl.origin.includes("workos.com")) {
        const startTime = Date.now();
        const { user } = await getWorkOS().userManagement.authenticateWithCode({
            code,
            clientId: getWorkOSClientId(),
        });

        const beforeSigningTime = Date.now();

        // eslint-disable-next-line no-console
        console.debug(`Time to authenticate with WorkOS: ${beforeSigningTime - startTime}ms`);

        token = await new SignJWT({
            user,
        })
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .setIssuer("https://buildwithfern.com")
            .sign(getJwtTokenSecret());

        const afterSigningTime = Date.now();

        // eslint-disable-next-line no-console
        console.debug(`Time to sign JWT: ${afterSigningTime - beforeSigningTime}ms`);
    } else {
        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN;
        if (!xFernHost) {
            throw new Error("NEXT_PUBLIC_DOCS_DOMAIN is not set");
        }

        const partnerLoginConfig = await getPartnerLoginConfig(xFernHost);
        if (!partnerLoginConfig) {
            throw new Error("API injection config is not set");
        }

        try {
            const form = new FormData();
            form.append("code", code);
            form.append("client_secret", partnerLoginConfig.secret);
            form.append("grant_type", "authorization_code");
            form.append("client_id", partnerLoginConfig.clientId);

            const response = await fetch(partnerLoginConfig.authEndpoint, {
                method: "POST",
                body: form,
            });

            if (!response.ok) {
                return redirectWithLoginError(state, "Couldn't login, please try again");
            }

            const data = await response.json();

            const accessToken = data.access_token;
            if (!accessToken) {
                return redirectWithLoginError(state, "Couldn't login, please try again");
            }
            const partnerLogin: PartnerLogin = {
                accessToken,
                loggedInAt: Date.now(),
                name: "rightbrain",
            };
            token = await new SignJWT({
                partnerLogin,
            })
                .setProtectedHeader({ alg: "HS256", typ: "JWT" })
                .setIssuedAt()
                .setExpirationTime("30d")
                .setIssuer("https://buildwithfern.com")
                .sign(getJwtTokenSecret());
        } catch (error) {
            return redirectWithLoginError(state, "Couldn't login, please try again");
        }
    }

    const res = redirectResponse(state ?? req.nextUrl.origin);
    res.cookies.set("fern_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 2592000,
    });

    return res;
}
