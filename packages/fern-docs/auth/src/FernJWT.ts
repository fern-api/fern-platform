import { SignJWT, jwtVerify } from "jose";
import { FernUserSchema, type AuthEdgeConfig, type FernUser } from "./types";
import { getJwtSecretKey } from "./workos";
import { getSessionFromToken, toSessionUserInfo } from "./workos-session";
import { toFernUser } from "./workos-user-to-fern-user";

// "user" is reserved for workos

interface Opts {
  secret?: string;
  issuer?: string;
}
export function signFernJWT(
  fern: FernUser,
  { secret, issuer }: Opts = {}
): Promise<string> {
  return new SignJWT({ fern })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .setIssuer(issuer ?? "https://buildwithfern.com")
    .sign(getJwtTokenSecret(secret));
}

export async function verifyFernJWT(
  token: string,
  secret?: string,
  issuer?: string
): Promise<FernUser> {
  const verified = await jwtVerify(token, getJwtTokenSecret(secret), {
    issuer: issuer ?? "https://buildwithfern.com",
  });
  // if the token is undefined, FernUser will be an empty object
  return FernUserSchema.optional().parse(verified.payload.fern) ?? {};
}

export async function verifyFernJWTConfig(
  token: string,
  authConfig: AuthEdgeConfig | undefined
): Promise<FernUser> {
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

  throw new Error("Auth config type is not supported");
}

export async function safeVerifyFernJWTConfig(
  token: string | undefined,
  authConfig: AuthEdgeConfig | undefined
): Promise<FernUser | undefined> {
  try {
    if (token) {
      return await verifyFernJWTConfig(token, authConfig);
    }
  } catch (e) {
    console.debug(String(e));
  }

  return undefined;
}

const encoder = new TextEncoder();

function getJwtTokenSecret(secret?: string): Uint8Array {
  return encoder.encode(secret ?? getJwtSecretKey());
}
