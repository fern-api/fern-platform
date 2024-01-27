// pages/api/callback.js
import { setCookie } from "cookies-next";
import { SignJWT } from "jose";
import type { NextApiRequest, NextApiResponse } from "next";
import { getJwtTokenSecret, getWorkOS, getWorkOSClientId } from "../../../auth";

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

    setCookie("token", token, {
        req,
        res,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
    });

    res.redirect("/");
};
