import { SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { getJwtTokenSecret, getWorkOS, getWorkOSClientId } from "../../../../utils/auth.js";
import { notFoundResponse, redirectResponse } from "../../../../utils/serverResponse.js";

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
    // The authorization code returned by AuthKit
    const code = req.nextUrl.searchParams.get("code");

    if (typeof code !== "string") {
        return notFoundResponse();
    }

    const startTime = Date.now();
    const { user } = await getWorkOS().userManagement.authenticateWithCode({
        code,
        clientId: getWorkOSClientId(),
    });

    const beforeSigningTime = Date.now();

    // eslint-disable-next-line no-console
    console.debug(`Time to authenticate with WorkOS: ${beforeSigningTime - startTime}ms`);

    // Create a JWT token with the user's information
    const token = await new SignJWT({
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
