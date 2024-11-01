import { FernUserSchema, type AuthEdgeConfig, type FernUser } from "@fern-ui/fern-docs-auth";
import { SignJWT, jwtVerify } from "jose";
import { getJwtSecretKey } from "./workos";
import { getSessionFromToken, toSessionUserInfo } from "./workos-session";
import { toFernUser } from "./workos-user-to-fern-user";

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
    // if the token is undefined, FernUser will be an empty object
    return FernUserSchema.optional().parse(verified.payload.fern) ?? {};
}

export async function verifyFernJWTConfig(token: string, authConfig: AuthEdgeConfig | undefined): Promise<FernUser> {
    if (!authConfig) {
        throw new Error("Auth config is undefined");
    }

    if (authConfig.type === "basic_token_verification") {
        return verifyFernJWT(token, authConfig.secret, authConfig.issuer);
    }

    if (authConfig.type === "sso" && authConfig.partner === "workos") {
        const session = await toSessionUserInfo(await getSessionFromToken(token));
        if (session.user) {
            return toFernUser(session);
        } else {
            throw new Error("Invalid WorkOS session");
        }
    }

    // TODO: validate workos token and organization
    throw new Error("Auth config type is not supported");
}

export async function safeVerifyFernJWTConfig(
    token: string | undefined,
    authConfig: AuthEdgeConfig | undefined,
): Promise<FernUser | undefined> {
    try {
        if (token) {
            return await verifyFernJWTConfig(token, authConfig);
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }

    return undefined;
}

const encoder = new TextEncoder();

function getJwtTokenSecret(secret?: string): Uint8Array {
    return encoder.encode(secret ?? getJwtSecretKey());
}
