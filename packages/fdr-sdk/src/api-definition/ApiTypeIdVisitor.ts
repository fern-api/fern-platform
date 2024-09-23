import { noop } from "ts-essentials";
import type { APIV1UI } from "../client/types";
import { visitDiscriminatedUnion } from "../utils/visitDiscriminatedUnion";

export class ApiTypeIdVisitor {
    public static visitEndpointDefinition(endpoint: APIV1UI.EndpointDefinition, visit: (typeId: string) => void): void {
        endpoint.pathParameters.forEach((pathParameter) => {
            ApiTypeIdVisitor.visitTypeReference(pathParameter.valueShape, visit);
        });
        endpoint.queryParameters.forEach((queryParameter) => {
            ApiTypeIdVisitor.visitTypeReference(queryParameter.valueShape, visit);
        });
        endpoint.requestHeaders.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.valueShape, visit);
        });
        endpoint.responseHeaders.forEach((header) => {
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

    public static visitWebSocketChannel(channel: APIV1UI.WebSocketChannel, visit: (typeId: string) => void): void {
        channel.requestHeaders.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.valueShape, visit);
        });
        channel.pathParameters.forEach((pathParameter) => {
            ApiTypeIdVisitor.visitTypeReference(pathParameter.valueShape, visit);
        });
        channel.queryParameters.forEach((queryParameter) => {
            ApiTypeIdVisitor.visitTypeReference(queryParameter.valueShape, visit);
        });
        channel.messages.forEach((message) => {
            ApiTypeIdVisitor.visitTypeShape(message.body, visit);
        });
    }

    public static visitWebhookDefinition(webhook: APIV1UI.WebhookDefinition, visit: (typeId: string) => void): void {
        webhook.headers.forEach((header) => {
            ApiTypeIdVisitor.visitTypeReference(header.valueShape, visit);
        });
        ApiTypeIdVisitor.visitTypeShape(webhook.payload.shape, visit);
    }

    public static visitHttpRequestBodyShape(
        bodyShape: APIV1UI.HttpRequestBodyShape,
        visit: (typeId: string) => void,
    ): void {
        return visitDiscriminatedUnion(bodyShape)._visit({
            object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
            reference: (value) => ApiTypeIdVisitor.visitTypeReference(value.value, visit),
            bytes: noop,
            formData: (value) => ApiTypeIdVisitor.visitFormDataRequest(value, visit),
        });
    }

    public static visitHttpResponseBodyShape(
        bodyShape: APIV1UI.HttpResponseBodyShape,
        visit: (typeId: string) => void,
    ): void {
        return visitDiscriminatedUnion(bodyShape)._visit({
            object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
            reference: (value) => ApiTypeIdVisitor.visitTypeReference(value.value, visit),
            fileDownload: noop,
            streamingText: noop,
            stream: (value) => ApiTypeIdVisitor.visitTypeShape(value.shape, visit),
        });
    }

    public static visitFormDataRequest(typeDefinition: APIV1UI.FormDataRequest, visit: (typeId: string) => void): void {
        return typeDefinition.fields.forEach((field) =>
            visitDiscriminatedUnion(field)._visit({
                file: noop,
                files: noop,
                property: (property) => ApiTypeIdVisitor.visitTypeReference(property.valueShape, visit),
            }),
        );
    }

    public static visitTypeDefinition(typeDefinition: APIV1UI.TypeDefinition, visit: (typeId: string) => void): void {
        return ApiTypeIdVisitor.visitTypeShape(typeDefinition.shape, visit);
    }

    public static visitTypeShape(typeShape: APIV1UI.TypeShape, visit: (typeId: string) => void): void {
        return visitDiscriminatedUnion(typeShape)._visit({
            object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
            alias: (value) => ApiTypeIdVisitor.visitTypeReference(value.value, visit),
            enum: noop,
            undiscriminatedUnion: (value) =>
                value.variants.forEach((variant) => ApiTypeIdVisitor.visitTypeReference(variant.shape, visit)),
            discriminatedUnion: (value) =>
                value.variants.forEach((variant) =>
                    ApiTypeIdVisitor.visitObjectType(variant.additionalProperties, visit),
                ),
        });
    }

    public static visitObjectType(typeShape: APIV1UI.ObjectType, visit: (typeId: string) => void): void {
        typeShape.extends.forEach(visit);
        typeShape.properties.forEach((property) => {
            ApiTypeIdVisitor.visitTypeReference(property.valueShape, visit);
        });
    }

    public static visitTypeReference(typeReference: APIV1UI.TypeReference, visit: (typeId: string) => void): void {
        return visitDiscriminatedUnion(typeReference)._visit({
            id: (value) => visit(value.value),
            primitive: noop,
            optional: (value) => ApiTypeIdVisitor.visitTypeReference(value.itemShape, visit),
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
