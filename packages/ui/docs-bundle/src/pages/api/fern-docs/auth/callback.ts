import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { getJwtTokenSecret, getWorkOS, getWorkOSClientId } from "../../../../utils/auth";
import { notFoundResponse, redirectResponse } from "../../../../utils/serverResponse";
import { getFeatureFlags } from "../feature-flags";
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
export default async function GET(req: NextRequest): Promise<NextResponse> {
    console.log('????? THIS IS A BACKEND CALLBACK HANDLER');

    // The authorization code returned by AuthKit
    const code = req.nextUrl.searchParams.get("code");

    if (typeof code !== "string") {
        return notFoundResponse();
    }
    let token;

    console.log('????? DEBUG, code: ', code)

    if (req.nextUrl.origin.includes("workos.com")) {
        const startTime = Date.now();
        const { user } = await getWorkOS().userManagement.authenticateWithCode({
            code,
            clientId: getWorkOSClientId(),
        });

        const beforeSigningTime = Date.now();

        // eslint-disable-next-line no-console
        console.debug(`Time to authenticate with WorkOS: ${beforeSigningTime - startTime}ms`);
        

        // Create a JWT token with the user's information
        token = await new SignJWT({
            // Here you might lookup and retrieve user details from your database
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
        // --------------------------------------------------------------------------------------WORK OSe
    } else {
        console.log('!!!!!! non workos token');
        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN;
        if (!xFernHost) {
            throw new Error("NEXT_PUBLIC_DOCS_DOMAIN is not set");
        }

        const {apiInjectionConfig} = await getFeatureFlags(xFernHost);    
    
        if (apiInjectionConfig == null) {
            throw new Error("API injection config is not set");
        }

        console.log('!!!!!! apiInjectionConfig: ', apiInjectionConfig);

        const response = await fetch(apiInjectionConfig['auth-endpoint'], {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code, secret: apiInjectionConfig.secret }),
        });

        if (!response.ok) {
            const error = await response.json();
            
            throw new Error(error.message);
        }

        const data = await response.json();
        console.log('!! data: ', data);

        token = await new SignJWT({
            // Here you might lookup and retrieve user details from your database
            name: data.name,
            apiKey: data.apiKey,
            refreshToken: data.refreshToken,
            expiresAt: data.expires
        })
            .setProtectedHeader({ alg: "HS256", typ: "JWT" })
            .setIssuedAt()
            .setExpirationTime("30d")
            .setIssuer("https://buildwithfern.com")
            .sign(getJwtTokenSecret());
    }

    const res = redirectResponse(req.nextUrl.origin);
    res.cookies.set("fern_token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 2592000,
    });
    return res;
}
