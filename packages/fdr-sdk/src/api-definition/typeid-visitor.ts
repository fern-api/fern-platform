import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { noop } from "ts-essentials";
import type * as Latest from "./latest";

export class ApiTypeIdVisitor {
    public static visitEndpointDefinition(
        endpoint: Latest.EndpointDefinition,
        visit: (typeId: Latest.TypeId) => void,
    ): void {
        endpoint.pathParameters?.forEach((pathParameter) => {
            ApiTypeIdVisitor.visitTypeReference(pathParameter.valueShape, visit);
        });
        endpoint.queryParameters?.forEach((queryParameter) => {
            ApiTypeIdVisitor.visitTypeReference(queryParameter.valueShape, visit);
        });
        endpoint.requestHeaders?.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.valueShape, visit);
        });
        endpoint.responseHeaders?.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.valueShape, visit);
        });
        if (endpoint.request?.body != null) {
            ApiTypeIdVisitor.visitHttpRequestBodyShape(endpoint.request.body, visit);
        }
        if (endpoint.response?.body != null) {
            ApiTypeIdVisitor.visitHttpResponseBodyShape(endpoint.response.body, visit);
        }

        endpoint.errors?.forEach((error) => {
            if (error.shape != null) {
                ApiTypeIdVisitor.visitTypeShape(error.shape, visit);
            }
        });
    }

    public static visitWebSocketChannel(
        channel: Latest.WebSocketChannel,
        visit: (typeId: Latest.TypeId) => void,
    ): void {
        channel.requestHeaders?.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.valueShape, visit);
        });
        channel.pathParameters?.forEach((pathParameter) => {
            ApiTypeIdVisitor.visitTypeReference(pathParameter.valueShape, visit);
        });
        channel.queryParameters?.forEach((queryParameter) => {
            ApiTypeIdVisitor.visitTypeReference(queryParameter.valueShape, visit);
        });
        channel.messages.forEach((message) => {
            ApiTypeIdVisitor.visitTypeShape(message.body, visit);
        });
    }

    public static visitWebhookDefinition(
        webhook: Latest.WebhookDefinition,
        visit: (typeId: Latest.TypeId) => void,
    ): void {
        webhook.headers?.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.valueShape, visit);
        });
        if (webhook.payload) {
            ApiTypeIdVisitor.visitTypeShape(webhook.payload.shape, visit);
        }
    }

    public static visitHttpRequestBodyShape(
        bodyShape: Latest.HttpRequestBodyShape,
        visit: (typeId: Latest.TypeId) => void,
    ): void {
        return visitDiscriminatedUnion(bodyShape)._visit({
            object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
            alias: (value) => ApiTypeIdVisitor.visitTypeReference(value.value, visit),
            bytes: noop,
            formData: (value) => ApiTypeIdVisitor.visitFormDataRequest(value, visit),
        });
    }

    public static visitHttpResponseBodyShape(
        bodyShape: Latest.HttpResponseBodyShape,
        visit: (typeId: Latest.TypeId) => void,
    ): void {
        return visitDiscriminatedUnion(bodyShape)._visit({
            object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
            alias: (value) => ApiTypeIdVisitor.visitTypeReference(value.value, visit),
            fileDownload: noop,
            streamingText: noop,
            stream: (value) => ApiTypeIdVisitor.visitTypeShape(value.shape, visit),
        });
    }

    public static visitFormDataRequest(
        typeDefinition: Latest.FormDataRequest,
        visit: (typeId: Latest.TypeId) => void,
    ): void {
        return typeDefinition.fields.forEach((field) =>
            visitDiscriminatedUnion(field)._visit({
                file: noop,
                files: noop,
                property: (property) => ApiTypeIdVisitor.visitTypeReference(property.valueShape, visit),
            }),
        );
    }

    public static visitTypeDefinition(
        typeDefinition: Latest.TypeDefinition,
        visit: (typeId: Latest.TypeId) => void,
    ): void {
        return ApiTypeIdVisitor.visitTypeShape(typeDefinition.shape, visit);
    }

    public static visitTypeShape(typeShape: Latest.TypeShape, visit: (typeId: Latest.TypeId) => void): void {
        return visitDiscriminatedUnion(typeShape)._visit({
            object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
            alias: (value) => ApiTypeIdVisitor.visitTypeReference(value.value, visit),
            enum: noop,
            undiscriminatedUnion: (value) =>
                value.variants.forEach((variant) => ApiTypeIdVisitor.visitTypeReference(variant.shape, visit)),
            discriminatedUnion: (value) =>
                value.variants.forEach((variant) => ApiTypeIdVisitor.visitObjectType(variant, visit)),
        });
    }

    public static visitObjectType(typeShape: Latest.ObjectType, visit: (typeId: Latest.TypeId) => void): void {
        typeShape.extends.forEach(visit);
        typeShape.properties.forEach((property) => {
            ApiTypeIdVisitor.visitTypeReference(property.valueShape, visit);
        });
    }

    public static visitTypeReference(
        typeReference: Latest.TypeReference,
        visit: (typeId: Latest.TypeId) => void,
    ): void {
        return visitDiscriminatedUnion(typeReference)._visit({
            id: (value) => visit(value.id),
            primitive: noop,
            optional: (value) => ApiTypeIdVisitor.visitTypeReference(value.shape, visit),
            list: (value) => ApiTypeIdVisitor.visitTypeReference(value.itemShape, visit),
            set: (value) => ApiTypeIdVisitor.visitTypeReference(value.itemShape, visit),
            map: (value) => {
                ApiTypeIdVisitor.visitTypeReference(value.keyShape, visit);
                ApiTypeIdVisitor.visitTypeReference(value.valueShape, visit);
            },
            literal: noop,
            unknown: noop,
        });
    }
}
