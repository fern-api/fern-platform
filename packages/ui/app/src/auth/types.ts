import { z } from "zod";

export const FernUserSchema = z.object({
    type: z.literal("user"),
    partner: z.union([z.literal("workos"), z.literal("ory")]),
    name: z.string(),
    email: z.string(),
});

export type FernUser = z.infer<typeof FernUserSchema>;

export const OAuthEdgeConfigSchema = z.object({
    type: z.literal("oauth2"),
    partner: z.literal("ory"),
    environment: z.string(),
    jwks: z.optional(z.string()),
    clientId: z.string(),
    clientSecret: z.string(),
    "api-key-injection-enabled": z.optional(z.boolean()),
});

export type OAuthEdgeConfig = z.infer<typeof OAuthEdgeConfigSchema>;

export const OAuthTokenResponseSchema = z.object({
    access_token: z.string(),
    expires_in: z.number(),
    refresh_token: z.string(),
    scope: z.string(),
    token_type: z.string(),
});

export type OAuthTokenResponse = z.infer<typeof OAuthTokenResponseSchema>;

export const OryAccessTokenSchema = z.object({
    aud: z.array(z.string()),
    client_id: z.string(),
    exp: z.number(),
    ext: z.object({
        avatar_url: z.string(),
        email: z.string(),
        name: z.string(),
        org_id: z.string(),
        project_id: z.string(),
        sso_email_verified: z.boolean(),
    }),
    iat: z.number(),
    iss: z.string(),
    jti: z.string(),
    nbf: z.number(),
    scp: z.array(z.string()),
    sub: z.string(),
});

export type OryAccessToken = z.infer<typeof OryAccessTokenSchema>;

export const JwkSchema = z.object({
    kty: z.string(), // Key Type (required)
    use: z.string().optional(), // Public Key Use (optional)
    key_ops: z.array(z.string()).optional(), // Key Operations (optional)
    alg: z.string().optional(), // Algorithm (optional)
    kid: z.string().optional(), // Key ID (optional)
    x5u: z.string().optional(), // X.509 URL (optional)
    x5c: z.array(z.string()).optional(), // X.509 Certificate Chain (optional)
    x5t: z.string().optional(), // X.509 Certificate SHA-1 Thumbprint (optional)
    "x5t#S256": z.string().optional(), // X.509 Certificate SHA-256 Thumbprint (optional)
});

// Define the schema for JWKS
export const JwksSchema = z.object({
    keys: z.array(JwkSchema), // Array of JWKs (required)
});

export type Jwk = z.infer<typeof JwkSchema>;
export type Jwks = z.infer<typeof JwksSchema>;
