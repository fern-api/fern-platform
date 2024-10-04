import { z } from "zod";

export const FernUserSchema = z.object({
    type: z.literal("user"),
    partner: z.union([z.literal("workos"), z.literal("ory"), z.literal("custom")]),
    name: z.string().optional(),
    email: z.string().optional(),
});

export type FernUser = z.infer<typeof FernUserSchema>;

export const AuthEdgeConfigOAuth2OrySchema = z.object({
    type: z.literal("oauth2"),
    partner: z.literal("ory"),
    environment: z.string(),
    jwks: z.optional(z.string()),
    scope: z.optional(z.string()),
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string().optional(),
    "api-key-injection-enabled": z.optional(z.boolean()),
});
export const AuthEdgeConfigOAuth2WebflowSchema = z.object({
    type: z.literal("oauth2"),
    partner: z.literal("webflow"),
    scope: z.optional(z.union([z.string(), z.array(z.string())])),
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string().optional(),
});

export const AuthEdgeConfigBasicTokenVerificationSchema = z.object({
    type: z.literal("basic_token_verification"),
    secret: z.string(),
    issuer: z.string(),
    redirect: z.string(),

    allowlist: z
        .array(z.string(), {
            description: "List of pages (regexp allowed) that are public and do not require authentication",
        })
        .optional(),
    denylist: z
        .array(z.string(), {
            description: "List of pages (regexp allowed) that are private and require authentication",
        })
        .optional(),
});

export const AuthEdgeConfigSchema = z.union([
    AuthEdgeConfigOAuth2OrySchema,
    AuthEdgeConfigOAuth2WebflowSchema,
    AuthEdgeConfigBasicTokenVerificationSchema,
    AuthEdgeConfigBasicTokenVerificationSchema,
]);

export type AuthEdgeConfig = z.infer<typeof AuthEdgeConfigSchema>;
export type AuthEdgeConfigOAuth2Ory = z.infer<typeof AuthEdgeConfigOAuth2OrySchema>;
export type AuthEdgeConfigOAuth2Webflow = z.infer<typeof AuthEdgeConfigOAuth2WebflowSchema>;
export type AuthEdgeConfigBasicTokenVerification = z.infer<typeof AuthEdgeConfigBasicTokenVerificationSchema>;

export const OAuthTokenResponseSchema = z.object({
    access_token: z.string(),
    expires_in: z.number(),
    refresh_token: z.string().optional(),
    scope: z.string(),
    token_type: z.string(),
});

export type OAuthTokenResponse = z.infer<typeof OAuthTokenResponseSchema>;

export const RightbrainUserSchema = z.object({
    avatar_url: z.string().optional(),
    email: z.string().optional(),
    name: z.string().optional(),
    org_id: z.string().optional(),
    project_id: z.string().optional(),
    sso_email_verified: z.boolean().optional(),
});

export const OryAccessTokenSchema = z.object({
    aud: z.array(z.string()),
    client_id: z.string().optional(),
    exp: z.number().optional(),
    ext: RightbrainUserSchema.optional(),
    iat: z.number().optional(),
    iss: z.string().optional(),
    jti: z.string().optional(),
    nbf: z.number().optional(),
    scp: z.array(z.string()),
    sub: z.string().optional(),
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
