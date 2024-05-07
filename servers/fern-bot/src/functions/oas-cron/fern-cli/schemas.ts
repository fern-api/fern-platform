// NOTE: This file is composed of schemas that are used to validate the generators.yml
// configuration file, and have been taken from the fern-cli package. Please keep both in sync.
import { z } from "zod";

export const DEFAULT_GROUP_GENERATORS_CONFIG_KEY = "default-group";
export const OPENAPI_LOCATION_KEY = "openapi";
export const API_ORIGIN_LOCATION_KEY = "spec-origin";
export const ASYNC_API_LOCATION_KEY = "async-api";

export const APIDefinitionPathSchema = z.string().describe("Path to the OpenAPI, AsyncAPI or Fern Definition");

export const APIDefintionWithOverridesSchema = z.object({
    path: APIDefinitionPathSchema,
    // TODO: Add support for pulling the API definition from another github repo
    // and from behind an authed URL. Right now this is for a basic cURL to get the def.
    origin: z
        .optional(z.string())
        .describe("The URL of the API definition origin, from which the file should be polled."),
});

export const APIDefinitionList = z.array(z.union([APIDefinitionPathSchema, APIDefintionWithOverridesSchema]));

export const APIConfigurationSchema = z.union([
    APIDefinitionPathSchema,
    APIDefintionWithOverridesSchema,
    APIDefinitionList,
]);

export type APIConfigurationSchema = z.infer<typeof APIConfigurationSchema>;

export const GeneratorsOpenAPIObjectSchema = z.strictObject({
    path: z.string(),
    origin: z.optional(z.string()),
});

export type GeneratorsOpenAPIObjectSchema = z.infer<typeof GeneratorsOpenAPIObjectSchema>;

export const GeneratorsOpenAPISchema = z.union([GeneratorsOpenAPIObjectSchema, z.string()]);

export type GeneratorsOpenAPISchema = z.infer<typeof GeneratorsOpenAPISchema>;

export const GeneratorsConfigurationSchema = z.object({
    api: z.optional(APIConfigurationSchema),

    // deprecated, use the `api` key instead
    [OPENAPI_LOCATION_KEY]: z.optional(GeneratorsOpenAPISchema),
    [API_ORIGIN_LOCATION_KEY]: z.optional(z.string()),
    [ASYNC_API_LOCATION_KEY]: z.optional(z.string()),
});

export type GeneratorsConfigurationSchema = z.infer<typeof GeneratorsConfigurationSchema>;
