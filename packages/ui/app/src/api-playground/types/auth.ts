import { z } from "zod";

export const PlaygroundAuthStateBearerTokenSchema = z.strictObject({
    token: z.string(),
});
export type PlaygroundAuthStateBearerToken = z.infer<typeof PlaygroundAuthStateBearerTokenSchema>;
export const PLAYGROUND_AUTH_STATE_BEARER_TOKEN_INITIAL: PlaygroundAuthStateBearerToken = { token: "" };

export const PlaygroundAuthStateHeaderSchema = z.strictObject({
    headers: z.record(z.string()),
});
export type PlaygroundAuthStateHeader = z.infer<typeof PlaygroundAuthStateHeaderSchema>;
export const PLAYGROUND_AUTH_STATE_HEADER_INITIAL: PlaygroundAuthStateHeader = { headers: {} };

export const PlaygroundAuthStateBasicAuthSchema = z.strictObject({
    username: z.string(),
    password: z.string(),
});
export type PlaygroundAuthStateBasicAuth = z.infer<typeof PlaygroundAuthStateBasicAuthSchema>;
export const PLAYGROUND_AUTH_STATE_BASIC_AUTH_INITIAL: PlaygroundAuthStateBasicAuth = { username: "", password: "" };

export const PlaygroundAuthStateSchema = z.strictObject({
    bearerAuth: PlaygroundAuthStateBearerTokenSchema.optional(),
    header: PlaygroundAuthStateHeaderSchema.optional(),
    basicAuth: PlaygroundAuthStateBasicAuthSchema.optional(),
});
export type PlaygroundAuthState = z.infer<typeof PlaygroundAuthStateSchema>;
