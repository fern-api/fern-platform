import { z } from "zod";

export const FernUserSchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    roles: z
        .union([z.string(), z.array(z.string())])
        .describe(
            "The roles of the token (can be a string or an array of strings) which limits what content users can access",
        )
        .optional(),
});

export type FernUser = z.infer<typeof FernUserSchema>;

// WorkOS is our only SSO provider for now, and is meant for private docs.
export const AuthEdgeConfigSSOWorkOSSchema = z.object({
    type: z.literal("sso"),
    partner: z.literal("workos"),
    organization: z.string().describe("This should be the org name, NOT the org ID"),

    // TODO: we can probably use the allowlist, denylist, and anonymous here too (similar to JWT basic auth)
});

// Note: this is a bit confusing, as it conflates API Playground auth with Fern Docs auth.
// TODO: it should be clear that anonymous users have access to all pages, and that the auth here is used only in the API Playground context.
export const AuthEdgeConfigOAuth2OrySchema = z.object({
    type: z.literal("oauth2"),
    partner: z.literal("ory"),
    environment: z.string(),
    jwks: z.optional(z.string()),
    scope: z.optional(z.string()),
    clientId: z.string(),
    clientSecret: z.string(),
    redirectUri: z.string().optional(),
    // TODO: this is a bit confusing. should we delete this field?
    "api-key-injection-enabled": z.optional(z.boolean()),
});

// Note: same as above; webflow oauth2 scheme is used just to generate a token for the API Playground.
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
    logout: z.string().optional(),

    allowlist: z
        .array(z.string())
        .describe("List of pages (regexp allowed) that are public and do not require authentication")
        .optional(),
    denylist: z
        .array(z.string())
        .describe("List of pages (regexp allowed) that are private and require authentication")
        .optional(),
    anonymous: z
        .array(z.string())
        .describe(
            "List of pages (regexp allowed) that are public and do not require authentication, but are hidden when the user is authenticated",
        )
        .optional(),
});

export const AuthEdgeConfigSchema = z.union([
    AuthEdgeConfigSSOWorkOSSchema,
    AuthEdgeConfigOAuth2OrySchema,
    AuthEdgeConfigOAuth2WebflowSchema,
    AuthEdgeConfigBasicTokenVerificationSchema,
]);

export type AuthEdgeConfig = z.infer<typeof AuthEdgeConfigSchema>;
export type AuthEdgeConfigSSOWorkOS = z.infer<typeof AuthEdgeConfigSSOWorkOSSchema>;
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
    kty: z.string().describe("Key Type"),
    use: z.string().optional().describe("Public Key Use"),
    key_ops: z.array(z.string()).optional().describe("Key Operations"),
    alg: z.string().optional().describe("Algorithm"),
    kid: z.string().optional().describe("Key ID"),
    x5u: z.string().optional().describe("X.509 URL"),
    x5c: z.array(z.string()).optional().describe("X.509 Certificate Chain"),
    x5t: z.string().optional().describe("X.509 Certificate SHA-1 Thumbprint"),
    "x5t#S256": z.string().optional().describe("X.509 Certificate SHA-256 Thumbprint"),
});

export const JwksSchema = z.object({
    keys: z.array(JwkSchema).describe("Array of JWKs"),
});

export type Jwk = z.infer<typeof JwkSchema>;
export type Jwks = z.infer<typeof JwksSchema>;
