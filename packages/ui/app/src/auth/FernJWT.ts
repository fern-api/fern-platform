import { SignJWT, jwtVerify } from "jose";
import { FernUser, FernUserSchema } from "./types";

// "user" is reserved for workos

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function signFernJWT(fern: FernUser, user?: any): Promise<string> {
    return new SignJWT({ fern, user })
        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .setIssuer("https://buildwithfern.com")
        .sign(getJwtTokenSecret());
}

export async function verifyFernJWT(token: string, secret?: string, issuer?: string): Promise<FernUser> {
    const verified = await jwtVerify(
        token,
        secret != null ? new Uint8Array(Buffer.from(secret)) : getJwtTokenSecret(),
        { issuer: issuer ?? "https://buildwithfern.com" },
    );
    return FernUserSchema.parse(verified.payload.fern);
}

function getJwtTokenSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET_KEY;

    if (secret != null) {
        return new Uint8Array(Buffer.from(secret, "base64"));
    }

    throw new Error("JWT_SECRET_KEY is not set");
}
