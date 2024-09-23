import { noop } from "ts-essentials";
import type { APIV1Read } from "../client/types";
import { visitDiscriminatedUnion } from "../utils/visitDiscriminatedUnion";

export class ReadApiTypeIdVisitor {
    public static visitEndpointDefinition(
        endpoint: APIV1Read.EndpointDefinition,
        visit: (typeId: string) => void,
    ): void {
        endpoint.path.pathParameters.forEach((pathParameter) => {
            ReadApiTypeIdVisitor.visitTypeReference(pathParameter.type, visit);
        });
        endpoint.queryParameters.forEach((queryParameter) => {
            ReadApiTypeIdVisitor.visitTypeReference(queryParameter.type, visit);
        });
        endpoint.headers.forEach((header) => {
            ReadApiTypeIdVisitor.visitTypeReference(header.type, visit);
        });
        if (endpoint.request != null) {
            ReadApiTypeIdVisitor.visitHttpRequestBodyShape(endpoint.request.type, visit);
        }
        if (endpoint.response != null) {
            ReadApiTypeIdVisitor.visitHttpResponseBodyShape(endpoint.response.type, visit);
        }
        if (endpoint.errorsV2 != null) {
            endpoint.errorsV2.forEach((error) => {
                if (error.type != null) {
                    ReadApiTypeIdVisitor.visitTypeShape(error.type, visit);
                }
            });
        }
    }

    public static visitWebSocketChannel(channel: APIV1Read.WebSocketChannel, visit: (typeId: string) => void): void {
        channel.headers.forEach((header) => {
            ReadApiTypeIdVisitor.visitTypeReference(header.type, visit);
        });
        channel.path.pathParameters.forEach((pathParameter) => {
            ReadApiTypeIdVisitor.visitTypeReference(pathParameter.type, visit);
        });
        channel.queryParameters.forEach((queryParameter) => {
            ReadApiTypeIdVisitor.visitTypeReference(queryParameter.type, visit);
        });
        channel.messages.forEach((message) => {
            ReadApiTypeIdVisitor.visitObjectOrReference(message.body, visit);
        });
    }

    public static visitWebhookDefinition(webhook: APIV1Read.WebhookDefinition, visit: (typeId: string) => void): void {
        webhook.headers.forEach((header) => {
            ReadApiTypeIdVisitor.visitTypeReference(header.type, visit);
        });
        ReadApiTypeIdVisitor.visitObjectOrReference(webhook.payload.type, visit);
    }

    public static visitHttpRequestBodyShape(
        bodyShape: APIV1Read.HttpRequestBodyShape,
        visit: (typeId: string) => void,
    ): void {
        return visitDiscriminatedUnion(bodyShape)._visit({
            object: (value) => ReadApiTypeIdVisitor.visitObjectType(value, visit),
            reference: (value) => ReadApiTypeIdVisitor.visitTypeReference(value.value, visit),
            bytes: noop,
            formData: (value) => ReadApiTypeIdVisitor.visitFormDataRequest(value, visit),
            fileUpload: (value) =>
                value.value != null ? ReadApiTypeIdVisitor.visitFormDataRequest(value.value, visit) : undefined,
        });
    }

    public static visitHttpResponseBodyShape(
        bodyShape: APIV1Read.HttpResponseBodyShape,
        visit: (typeId: string) => void,
    ): void {
        return visitDiscriminatedUnion(bodyShape)._visit({
            object: (value) => ReadApiTypeIdVisitor.visitObjectType(value, visit),
            reference: (value) => ReadApiTypeIdVisitor.visitTypeReference(value.value, visit),
            fileDownload: noop,
            streamingText: noop,
            stream: (value) => ReadApiTypeIdVisitor.visitObjectOrReference(value.shape, visit),
            streamCondition: (value) => {
                ReadApiTypeIdVisitor.visitObjectOrReference(value.response.shape, visit);
                ReadApiTypeIdVisitor.visitObjectOrReference(value.streamResponse.shape, visit);
            },
        });
    }

    public static visitObjectOrReference(bodyShape: APIV1Read.JsonBodyShape, visit: (typeId: string) => void): void {
        return visitDiscriminatedUnion(bodyShape)._visit({
            object: (value) => ReadApiTypeIdVisitor.visitObjectType(value, visit),
            reference: (value) => ReadApiTypeIdVisitor.visitTypeReference(value.value, visit),
        });
    }

    public static visitFormDataRequest(
        typeDefinition: APIV1Read.FormDataRequest,
        visit: (typeId: string) => void,
    ): void {
        return typeDefinition.properties.forEach((property) =>
            visitDiscriminatedUnion(property)._visit({
                file: noop,
                bodyProperty: (bodyProperty) => ReadApiTypeIdVisitor.visitTypeReference(bodyProperty.valueType, visit),
            }),
        );
    }

    public static visitTypeDefinition(typeDefinition: APIV1Read.TypeDefinition, visit: (typeId: string) => void): void {
        return ReadApiTypeIdVisitor.visitTypeShape(typeDefinition.shape, visit);
    }

    public static visitTypeShape(typeShape: APIV1Read.TypeShape, visit: (typeId: string) => void): void {
        return visitDiscriminatedUnion(typeShape)._visit({
            object: (value) => ReadApiTypeIdVisitor.visitObjectType(value, visit),
            alias: (value) => ReadApiTypeIdVisitor.visitTypeReference(value.value, visit),
            enum: noop,
            undiscriminatedUnion: (value) =>
                value.variants.forEach((variant) => ReadApiTypeIdVisitor.visitTypeReference(variant.type, visit)),
            discriminatedUnion: (value) =>
                value.variants.forEach((variant) =>
                    ReadApiTypeIdVisitor.visitObjectType(variant.additionalProperties, visit),
                ),
        });
    }

    public static visitObjectType(typeShape: APIV1Read.ObjectType, visit: (typeId: string) => void): void {
        typeShape.extends.forEach(visit);
        typeShape.properties.forEach((property) => {
            ReadApiTypeIdVisitor.visitTypeReference(property.valueType, visit);
        });
    }

    public static visitTypeReference(typeReference: APIV1Read.TypeReference, visit: (typeId: string) => void): void {
        return visitDiscriminatedUnion(typeReference)._visit({
            id: (value) => visit(value.value),
            primitive: noop,
            optional: (value) => ReadApiTypeIdVisitor.visitTypeReference(value.itemType, visit),
            list: (value) => ReadApiTypeIdVisitor.visitTypeReference(value.itemType, visit),
            set: (value) => ReadApiTypeIdVisitor.visitTypeReference(value.itemType, visit),
            map: (value) => {
                ReadApiTypeIdVisitor.visitTypeReference(value.keyType, visit);
                ReadApiTypeIdVisitor.visitTypeReference(value.valueType, visit);
            },
            literal: noop,
            unknown: noop,
        });
    }
}
