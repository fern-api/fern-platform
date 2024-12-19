import { z } from "zod";

export const PlaygroundAuthStateBearerTokenSchema = z.strictObject({
    token: z.string(),
});
export type PlaygroundAuthStateBearerToken = z.infer<
    typeof PlaygroundAuthStateBearerTokenSchema
>;
export const PLAYGROUND_AUTH_STATE_BEARER_TOKEN_INITIAL: PlaygroundAuthStateBearerToken =
    { token: "" };

export const PlaygroundAuthStateHeaderSchema = z.strictObject({
    headers: z.record(z.string()),
});
export type PlaygroundAuthStateHeader = z.infer<
    typeof PlaygroundAuthStateHeaderSchema
>;
export const PLAYGROUND_AUTH_STATE_HEADER_INITIAL: PlaygroundAuthStateHeader = {
    headers: {},
};

export const PlaygroundAuthStateBasicAuthSchema = z.strictObject({
    username: z.string(),
    password: z.string(),
});
export type PlaygroundAuthStateBasicAuth = z.infer<
    typeof PlaygroundAuthStateBasicAuthSchema
>;
export const PLAYGROUND_AUTH_STATE_BASIC_AUTH_INITIAL: PlaygroundAuthStateBasicAuth =
    { username: "", password: "" };

export const PlaygroundAuthStateOAuthSchema = z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    accessToken: z.string(),
    refreshToken: z.string(),
    authorizationUrl: z.string(),
    tokenUrl: z.string(),
    tokenPrefix: z.string(),
    scopes: z.array(z.string()),
    isLoggedIn: z.boolean(),
    isLoggingIn: z.boolean(),
    selectedInputMethod: z.enum(["credentials", "token"]),
    loggedInStartingToken: z.string(),
    userSuppliedAccessToken: z.string(),
});
export type PlaygroundAuthStateOAuth = z.infer<
    typeof PlaygroundAuthStateOAuthSchema
>;
export const PLAYGROUND_AUTH_STATE_OAUTH_INITIAL: PlaygroundAuthStateOAuth = {
    clientId: "",
    clientSecret: "",
    accessToken: "",
    refreshToken: "",
    authorizationUrl: "",
    tokenUrl: "",
    tokenPrefix: "",
    scopes: [],

    isLoggedIn: false,
    isLoggingIn: false,
    selectedInputMethod: "credentials",
    loggedInStartingToken: "",
    userSuppliedAccessToken: "",
};

export const PlaygroundAuthStateSchema = z.strictObject({
    bearerAuth: PlaygroundAuthStateBearerTokenSchema.optional(),
    header: PlaygroundAuthStateHeaderSchema.optional(),
    basicAuth: PlaygroundAuthStateBasicAuthSchema.optional(),
    oauth: PlaygroundAuthStateOAuthSchema.optional(),
});
export type PlaygroundAuthState = z.infer<typeof PlaygroundAuthStateSchema>;
