import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { noop } from "ts-essentials";
import {
    ResolvedCodeSnippet,
    ResolvedEndpointDefinition,
    ResolvedExampleEndpointCall,
    ResolvedExampleEndpointRequest,
    ResolvedExampleEndpointResponse,
    ResolvedFormValue,
    ResolvedHttpResponseStreamShape,
    ResolvedObjectProperty,
    ResolvedRequestBody,
    ResolvedResponseBody,
    ResolvedTypeShape,
    visitResolvedHttpRequestBodyShape,
    visitResolvedHttpResponseBodyShape,
} from "./types";

/**
 * @deprecated
 */
export interface ResolvedExampleValueWithSchema {
    schema: ResolvedTypeShape;
    value: unknown;
}

/**
 * @deprecated
 */
export type ResolvedExampleEndpointRequestWithSchema =
    | ResolvedExampleEndpointRequestWithSchema.Json
    | ResolvedExampleEndpointRequestWithSchema.Form
    | ResolvedExampleEndpointRequestWithSchema.Bytes;

/**
 * @deprecated
 */
export declare namespace ResolvedExampleEndpointRequestWithSchema {
    interface Json {
        type: "json";
        schema: ResolvedTypeShape;
        value: unknown;
    }

    interface Form {
        type: "form";
        value: Record<string, ResolvedExampleFormValueWithSchema>;
    }

    interface Bytes extends ResolvedExampleEndpointRequest.Bytes, APIV1Read.HttpRequestBodyShape.Bytes {}
}

/**
 * @deprecated
 */
export type ResolvedExampleFormValueWithSchema =
    | ResolvedExampleFormValueWithSchema.Json
    | ResolvedExampleFormValueWithSchema.SingleFile
    | ResolvedExampleFormValueWithSchema.MultipleFiles;

/**
 * @deprecated
 */
export declare namespace ResolvedExampleFormValueWithSchema {
    interface Json {
        type: "json";
        value: unknown | undefined;
        contentType: string | undefined;
        schema: ResolvedTypeShape;
    }

    interface SingleFile extends ResolvedFormValue.SingleFile {
        type: "file";
        fileName: string;
        fileId: string | undefined; // lookup file by UUID
    }

    interface MultipleFiles extends ResolvedFormValue.MultipleFiles {
        type: "fileArray";
        files: SingleFile[];
    }
}

/**
 * @deprecated
 */
export type ResolvedExampleEndpointResponseWithSchema =
    | ResolvedExampleEndpointResponseWithSchema.Json
    | ResolvedExampleEndpointResponseWithSchema.Filename
    | ResolvedExampleEndpointResponseWithSchema.Stream
    | ResolvedExampleEndpointResponseWithSchema.ServerSentEvents;

/**
 * @deprecated
 */
export declare namespace ResolvedExampleEndpointResponseWithSchema {
    interface Json {
        type: "json";
        value: unknown | undefined;
        schema: ResolvedTypeShape;
        statusCode: number;
    }

    interface Filename {
        type: "filename";
        value: string | undefined;
        schema: APIV1Read.HttpResponseBodyShape.FileDownload;
        statusCode: number;
    }

    interface Stream {
        type: "stream";
        value: unknown[];
        schema: ResolvedHttpResponseStreamShape;
    }

    interface ServerSentEvent {
        event: string;
        data: unknown | undefined;
    }

    interface ServerSentEvents {
        type: "sse";
        value: ServerSentEvent[];
        schema: ResolvedHttpResponseStreamShape;
    }
}

/**
 * @deprecated
 */
export interface ResolvedExampleEndpointCallWithSchema {
    name: string | undefined;
    description: string | undefined;
    path: string;
    pathParameters: Record<string, ResolvedExampleValueWithSchema>;
    queryParameters: Record<string, ResolvedExampleValueWithSchema>;
    headers: Record<string, ResolvedExampleValueWithSchema>;
    requestBody: ResolvedExampleEndpointRequestWithSchema | undefined;
    responseStatusCode: number;
    responseBody: ResolvedExampleEndpointResponseWithSchema | undefined;
    snippets: ResolvedCodeSnippet[];
}

/**
 * @deprecated
 */
function mergeSchemaWithExample(
    properties: ResolvedObjectProperty[] | undefined,
    example: Record<string, unknown> | undefined,
): Record<string, ResolvedExampleValueWithSchema> {
    if (properties == null || example == null) {
        return {};
    }

    return properties.reduce<Record<string, ResolvedExampleValueWithSchema>>((acc, property) => {
        acc[property.key] = {
            schema: property.valueShape,
            value: example[property.key],
        };
        return acc;
    }, {});
}

/**
 * @deprecated
 */
function mergeRequestBodySchemaWithExample(
    requestBody: ResolvedRequestBody | undefined,
    example: ResolvedExampleEndpointRequest | undefined,
): ResolvedExampleEndpointRequestWithSchema | undefined {
    if (requestBody == null || example == null) {
        return undefined;
    }

    return visitResolvedHttpRequestBodyShape<ResolvedExampleEndpointRequestWithSchema | undefined>(requestBody.shape, {
        formData: (schema) => {
            if (example.type !== "form") {
                return undefined;
            }
            const value: Record<string, ResolvedExampleFormValueWithSchema> = {};

            for (const property of schema.properties) {
                const propertyValue = example.value[property.key];
                if (propertyValue == null) {
                    continue;
                }

                visitDiscriminatedUnion(property, "type")._visit({
                    file: (fileValue) => {
                        if (propertyValue.type === "file") {
                            value[property.key] = {
                                ...fileValue,
                                ...propertyValue,
                            };
                        }
                    },
                    fileArray: (fileArrayValue) => {
                        if (propertyValue.type === "fileArray") {
                            value[property.key] = {
                                ...fileArrayValue,
                                ...propertyValue,
                            };
                        }
                    },
                    bodyProperty: (bodyProperty) => {
                        if (propertyValue.type === "json") {
                            value[property.key] = {
                                type: "json",
                                contentType: propertyValue.contentType,
                                schema: bodyProperty.valueShape,
                                value: propertyValue.value,
                            };
                        }
                    },
                    _other: noop,
                });
            }

            return { type: "form", value };
        },
        bytes: (schema) => {
            if (example.type !== "bytes") {
                return undefined;
            }

            return { ...example, ...schema };
        },
        typeShape: (schema) => {
            if (example.type !== "json") {
                return undefined;
            }

            return {
                type: "json",
                schema,
                value: example.value,
            };
        },
    });
}

/**
 * @deprecated
 */
function mergeResponseBodySchemaWithExample(
    responseBody: ResolvedResponseBody | undefined,
    example: ResolvedExampleEndpointResponse | undefined,
): ResolvedExampleEndpointResponseWithSchema | undefined {
    if (responseBody == null) {
        return undefined;
    }

    return visitResolvedHttpResponseBodyShape<ResolvedExampleEndpointResponseWithSchema | undefined>(
        responseBody.shape,
        {
            fileDownload: (schema) => ({
                type: "filename",
                value: example?.type === "filename" ? example.value : undefined,
                schema,
                statusCode: responseBody.statusCode,
            }),
            streamingText: (schema) => {
                if (example?.type === "stream") {
                    return { type: "stream", value: example.value, schema };
                } else if (example?.type === "sse") {
                    return { type: "sse", value: example.value, schema };
                } else {
                    return undefined;
                }
            },
            streamCondition: (schema) => {
                if (example?.type === "stream") {
                    return { type: "stream", value: example.value, schema };
                } else if (example?.type === "sse") {
                    return { type: "sse", value: example.value, schema };
                } else {
                    return undefined;
                }
            },
            stream: (schema) => {
                if (example?.type === "stream") {
                    return { type: "stream", value: example.value, schema };
                } else if (example?.type === "sse") {
                    return { type: "sse", value: example.value, schema };
                } else {
                    return undefined;
                }
            },
            typeShape: (schema) => {
                if (example == null || example.type !== "json") {
                    return undefined;
                }

                return { type: "json", schema, value: example.value, statusCode: responseBody.statusCode };
            },
        },
    );
}

/**
 * @deprecated
 */
export function mergeEndpointSchemaWithExample(
    endpoint: ResolvedEndpointDefinition | undefined,
    example: ResolvedExampleEndpointCall,
): ResolvedExampleEndpointCallWithSchema {
    return {
        name: example.name,
        description: example.description,
        path: example.path,
        pathParameters: mergeSchemaWithExample(endpoint?.pathParameters, example.pathParameters),
        queryParameters: mergeSchemaWithExample(endpoint?.queryParameters, example.queryParameters),
        headers: mergeSchemaWithExample(endpoint?.headers, example.headers),
        requestBody: mergeRequestBodySchemaWithExample(endpoint?.requestBody, example.requestBody),
        responseStatusCode: example.responseStatusCode,
        responseBody: mergeResponseBodySchemaWithExample(endpoint?.responseBody, example.responseBody),
        snippets: example.snippets,
    };
}
