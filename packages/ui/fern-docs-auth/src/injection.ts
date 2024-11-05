import { z } from "zod";

export const APIKeyInjectionConfigDisabledSchema = z.object({
    enabled: z.literal(false),
    returnToQueryParam: z.string(),
});

export const APIKeyInjectionConfigUnauthorizedSchema = z.object({
    enabled: z.literal(true),
    authenticated: z.literal(false),
    authorizationUrl: z.string(),
    partner: z.string().optional(),
    returnToQueryParam: z.string(),
});

export const APIKeyInjectionConfigAuthorizedSchema = z.object({
    enabled: z.literal(true),
    authenticated: z.literal(true),
    access_token: z.string(),
    partner: z.string().optional(),
    returnToQueryParam: z.string(),
});

export const APIKeyInjectionConfigSchema = z.union([
    APIKeyInjectionConfigDisabledSchema,
    APIKeyInjectionConfigUnauthorizedSchema,
    APIKeyInjectionConfigAuthorizedSchema,
]);

export type APIKeyInjectionConfigDisabled = z.infer<typeof APIKeyInjectionConfigDisabledSchema>;
export type APIKeyInjectionConfigUnauthorized = z.infer<typeof APIKeyInjectionConfigUnauthorizedSchema>;
export type APIKeyInjectionConfigAuthorized = z.infer<typeof APIKeyInjectionConfigAuthorizedSchema>;
export type APIKeyInjectionConfig = z.infer<typeof APIKeyInjectionConfigSchema>;
