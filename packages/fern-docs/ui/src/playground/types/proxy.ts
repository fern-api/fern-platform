import { z } from "zod";
import {
    SerializableFileSchema,
    SerializableFormDataEntryValueSchema,
    SerializableJsonSchema,
} from "./serializable";

export const SerializableFormDataSchema = z.object({
    type: z.literal("form-data"),
    value: z.record(SerializableFormDataEntryValueSchema),
});

export type SerializableFormData = z.infer<typeof SerializableFormDataSchema>;

export const SerializableOctetStreamSchema = z.object({
    type: z.literal("octet-stream"),
    value: SerializableFileSchema.optional(),
});

export const SerializableBodySchema = z.union([
    SerializableJsonSchema,
    SerializableFormDataSchema,
    SerializableOctetStreamSchema,
]);

export const ProxyRequestSchema = z.object({
    url: z.string(),
    method: z.string(),
    headers: z.record(z.string()),
    body: SerializableBodySchema.optional(),
    stream: z.boolean().optional(),
    streamTerminator: z.string().optional(),
});

export type ProxyRequest = z.infer<typeof ProxyRequestSchema>;

export declare namespace ProxyRequest {
    export type SerializableOctetStream = z.infer<
        typeof SerializableOctetStreamSchema
    >;
    export type SerializableBody = z.infer<typeof SerializableBodySchema>;
    export type ProxyRequest = z.infer<typeof ProxyRequestSchema>;
}

// TODO: think about this after pinecone hack

export const GrpcProxyRequestSchema = z.object({
    url: z.string(),
    endpointId: z.string(),
    headers: z.record(z.string()),
    body: SerializableBodySchema.optional(),
});

export type GrpcProxyRequest = z.infer<typeof GrpcProxyRequestSchema>;

export declare namespace ProxyResponse {
    export interface SerializableResponse {
        readonly headers: Record<string, string>;
        readonly ok: boolean;
        readonly redirected: boolean;
        readonly status: number;
        readonly statusText: string;
        readonly type: ResponseType;
        readonly url: string;
    }

    export interface SerializableBody extends SerializableResponse {
        readonly body: unknown;
    }

    export interface SerializableFileBody extends SerializableResponse {
        readonly body: string;
    }
}

export interface ProxyResponse {
    response: ProxyResponse.SerializableBody;
    time: number;
    size: string | null;
}
