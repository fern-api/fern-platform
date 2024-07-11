import { z } from "zod";

export const FernUserSchema = z.object({
    type: z.literal("user"),
    partner: z.union([z.literal("workos"), z.literal("ory"), z.literal("custom")]),
    name: z.string(),
    email: z.string(),
});

export type FernUser = z.infer<typeof FernUserSchema>;

export const AuthEdgeConfigOAuth2Schema = z.object({
    type: z.literal("oauth2"),
    partner: z.literal("ory"),
    environment: z.string(),
    clientId: z.string(),
    clientSecret: z.string(),
    "api-key-injection-enabled": z.optional(z.boolean()),
});

export const AuthEdgeConfigBasicTokenVerificationSchema = z.object({
    type: z.literal("basic_token_verification"),
    secret: z.string(),
    issuer: z.string(),
    redirect: z.string(),
});

export const AuthEdgeConfigSchema = z.union([AuthEdgeConfigOAuth2Schema, AuthEdgeConfigBasicTokenVerificationSchema]);

export type AuthEdgeConfig = z.infer<typeof AuthEdgeConfigSchema>;
export type AuthEdgeConfigOAuth2 = z.infer<typeof AuthEdgeConfigOAuth2Schema>;
export type AuthEdgeConfigBasicTokenVerification = z.infer<typeof AuthEdgeConfigBasicTokenVerificationSchema>;

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
