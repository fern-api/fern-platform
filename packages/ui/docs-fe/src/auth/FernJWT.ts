import { SignJWT, jwtVerify } from "jose";
import { AuthEdgeConfig, FernUser, FernUserSchema } from "./types";

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
    const verified = await jwtVerify(token, getJwtTokenSecret(secret), {
        issuer: issuer ?? "https://buildwithfern.com",
    });
    return FernUserSchema.parse(verified.payload.fern);
}

export async function verifyFernJWTConfig(token: string, authConfig: AuthEdgeConfig | undefined): Promise<FernUser> {
    if (authConfig?.type === "basic_token_verification") {
        return verifyFernJWT(token, authConfig.secret, authConfig.issuer);
    } else {
        return verifyFernJWT(token);
    }
}

const encoder = new TextEncoder();

function getJwtTokenSecret(secret?: string): Uint8Array {
    if (secret == null) {
        secret = process.env.JWT_SECRET_KEY;
    }

    if (secret != null) {
        return encoder.encode(secret);
    }

    throw new Error("JWT_SECRET_KEY is not set");
}
