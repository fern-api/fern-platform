import { z } from "zod";

export const APIKeyInjectionConfigDisabledSchema = z.object({
    enabled: z.literal(false),
});

export const APIKeyInjectionConfigUnauthorizedSchema = z.object({
    enabled: z.literal(true),
    authenticated: z.literal(false),
    url: z.string(),
    partner: z.string().optional(),
});

export const APIKeyInjectionConfigAuthorizedSchema = z.object({
    enabled: z.literal(true),
    authenticated: z.literal(true),
    access_token: z.string(),
    refresh_token: z.string().optional(),
    exp: z.number().optional(),
    partner: z.string().optional(),
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
