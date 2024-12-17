import { z } from "zod";
import { AvailabilitySchema } from "../shared/types";

export const TurbopufferAttributeDataSchema = z.union([
    z.string(), // string
    z.number().positive().int(), // uint
    z.string().uuid(), // uuid
    z.boolean(), // bool
    z.array(z.string()), // []string
    z.array(z.number().positive().int()), // []uint
    z.array(z.string().uuid()), // []uuid
]);

export type TurbopufferAttributeData = z.infer<typeof TurbopufferAttributeDataSchema>;

export const FernTurbopufferRecordSchema = z.object({
    id: z.string(),
    vector: z.array(z.number()).optional(),
    attributes: z.object({
        chunk: z.string(),

        type: z.union([z.literal("markdown"), z.literal("api-reference")]),
        org_id: z.string(),
        domain: z.string(),
        visible_by: z.array(z.string()).optional(),
        authed: z.boolean().optional(),

        title: z.string(),
        canonicalPathname: z.string(),
        pathname: z.string(),
        hash: z.string().optional(),
        icon: z.string().optional(),
        availability: AvailabilitySchema.optional(),
        description: z.string().optional(),
        code_snippets: z.array(z.string()).optional(),
        code_snippet_langs: z.array(z.string()).optional(),
        breadcrumb: z.array(z.string()).optional(),
        product: z.string().optional(),
        version: z.string().optional(),
        tab: z.string().optional(),
        keywords: z.union([z.string(), z.array(z.string())]).optional(),
        page_position: z.number().optional(),
        h0: z.string().optional(),
        h1: z.string().optional(),
        h2: z.string().optional(),
        h3: z.string().optional(),
        h4: z.string().optional(),
        h5: z.string().optional(),
        h6: z.string().optional(),
        content: z.string().optional(),
        level: z.number().min(0).max(6).optional(),
        date: z.string().date().optional(),
        date_timestamp: z.number().optional(),
        api_definition_id: z.string().optional(),
        api_endpoint_id: z.string().optional(),
        api_type: z.enum(["http", "webhook", "websocket"]).optional(),
        method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
        endpoint_path: z.string().optional(),
        endpoint_path_alternates: z.array(z.string()).optional(),
        response_type: z.enum(["stream", "file", "json"]).optional(),
        environments: z.array(z.string()).optional(),
        default_environment_id: z.string().optional(),
    }),
});

export type FernTurbopufferRecord = z.infer<typeof FernTurbopufferRecordSchema>;
export type FernTurbopufferAttributes = FernTurbopufferRecord["attributes"];

export type FernTurbopufferRecordWithoutVector = Omit<FernTurbopufferRecord, "vector">;

export const FernTurbopufferAttributeSchema: Record<
    keyof FernTurbopufferAttributes,
    {
        type: "string" | "uint" | "uuid" | "bool" | "[]string" | "[]uint" | "[]uuid";
        filterable: boolean;
        bm25: boolean;
    }
> = {
    chunk: {
        type: "string",
        filterable: false,
        bm25: true,
    },

    type: {
        type: "string",
        filterable: true,
        bm25: false,
    },
    org_id: {
        type: "string",
        filterable: true,
        bm25: false,
    },
    domain: {
        type: "string",
        filterable: true,
        bm25: false,
    },
    visible_by: {
        type: "[]string",
        filterable: true,
        bm25: false,
    },
    authed: {
        type: "bool",
        filterable: true,
        bm25: false,
    },
    title: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    canonicalPathname: {
        type: "string",
        filterable: false,
        bm25: false,
    },
    pathname: {
        type: "string",
        filterable: true,
        bm25: true,
    },
    hash: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    icon: {
        type: "string",
        filterable: false,
        bm25: false,
    },
    availability: {
        type: "string",
        filterable: true,
        bm25: true,
    },
    description: {
        type: "string",
        filterable: false,
        bm25: false,
    },
    code_snippets: {
        type: "[]string",
        filterable: false,
        bm25: false,
    },
    code_snippet_langs: {
        type: "[]string",
        filterable: false,
        bm25: false,
    },
    breadcrumb: {
        type: "[]string",
        filterable: false,
        bm25: false,
    },
    product: {
        type: "string",
        filterable: true,
        bm25: true,
    },
    version: {
        type: "string",
        filterable: true,
        bm25: true,
    },
    tab: {
        type: "string",
        filterable: true,
        bm25: false,
    },
    keywords: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    page_position: {
        type: "uint",
        filterable: true,
        bm25: false,
    },
    h0: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    h1: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    h2: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    h3: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    h4: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    h5: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    h6: {
        type: "string",
        filterable: false,
        bm25: true,
    },
    content: {
        type: "string",
        filterable: false,
        bm25: false,
    },
    level: {
        type: "uint",
        filterable: false,
        bm25: false,
    },
    date: {
        type: "string",
        filterable: false,
        bm25: false,
    },
    date_timestamp: {
        type: "uint",
        filterable: false,
        bm25: false,
    },
    api_definition_id: {
        type: "string",
        filterable: true,
        bm25: false,
    },
    api_endpoint_id: {
        type: "string",
        filterable: true,
        bm25: false,
    },
    api_type: {
        type: "string",
        filterable: true,
        bm25: false,
    },
    method: {
        type: "string",
        filterable: true,
        bm25: true,
    },
    endpoint_path: {
        type: "string",
        filterable: true,
        bm25: true,
    },
    endpoint_path_alternates: {
        type: "[]string",
        filterable: false,
        bm25: true,
    },
    response_type: {
        type: "string",
        filterable: true,
        bm25: false,
    },
    environments: {
        type: "[]string",
        filterable: false,
        bm25: false,
    },
    default_environment_id: {
        type: "string",
        filterable: true,
        bm25: false,
    },
};
