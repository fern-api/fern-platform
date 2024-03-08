import { SignJWT } from "jose";
import type { NextApiRequest, NextApiResponse } from "next";
import { getJwtTokenSecret, getWorkOS, getWorkOSClientId } from "../../../../utils/auth";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    // The authorization code returned by AuthKit
    const code = req.query.code as string;

    const { user } = await getWorkOS().userManagement.authenticateWithCode({
        code,
        clientId: getWorkOSClientId(),
    });

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

    res.setHeader("Set-Cookie", `fern_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);

    res.redirect("/");
};
