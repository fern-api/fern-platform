import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { noop } from "ts-essentials";

import type { APIV1Read } from "../client/types";

export class ApiTypeIdVisitor {
  public static visitEndpointDefinition(
    endpoint: APIV1Read.EndpointDefinition,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    endpoint.path.pathParameters.forEach((pathParameter) => {
      ApiTypeIdVisitor.visitTypeReference(pathParameter.type, visit);
    });
    endpoint.queryParameters.forEach((queryParameter) => {
      ApiTypeIdVisitor.visitTypeReference(queryParameter.type, visit);
    });
    endpoint.headers.forEach((header) => {
      ApiTypeIdVisitor.visitTypeReference(header.type, visit);
    });
    if (endpoint.request != null) {
      ApiTypeIdVisitor.visitHttpRequestBodyShape(endpoint.request.type, visit);
    }
    if (endpoint.response != null) {
      ApiTypeIdVisitor.visitHttpResponseBodyShape(
        endpoint.response.type,
        visit
      );
    }
    if (endpoint.errorsV2 != null) {
      endpoint.errorsV2.forEach((error) => {
        if (error.type != null) {
          ApiTypeIdVisitor.visitTypeShape(error.type, visit);
        }
      });
    }
  }

  public static visitWebSocketChannel(
    channel: APIV1Read.WebSocketChannel,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    channel.headers.forEach((header) => {
      ApiTypeIdVisitor.visitTypeReference(header.type, visit);
    });
    channel.path.pathParameters.forEach((pathParameter) => {
      ApiTypeIdVisitor.visitTypeReference(pathParameter.type, visit);
    });
    channel.queryParameters.forEach((queryParameter) => {
      ApiTypeIdVisitor.visitTypeReference(queryParameter.type, visit);
    });
    channel.messages.forEach((message) => {
      ApiTypeIdVisitor.visitObjectOrReference(message.body, visit);
    });
  }

  public static visitWebhookDefinition(
    webhook: APIV1Read.WebhookDefinition,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    webhook.headers.forEach((header) => {
      ApiTypeIdVisitor.visitTypeReference(header.type, visit);
    });
    ApiTypeIdVisitor.visitObjectOrReference(webhook.payload.type, visit);
  }

  public static visitHttpRequestBodyShape(
    bodyShape: APIV1Read.HttpRequestBodyShape,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    return visitDiscriminatedUnion(bodyShape)._visit({
      object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
      reference: (value) =>
        ApiTypeIdVisitor.visitTypeReference(value.value, visit),
      bytes: noop,
      formData: (value) => ApiTypeIdVisitor.visitFormDataRequest(value, visit),
      fileUpload: (value) =>
        value.value != null
          ? ApiTypeIdVisitor.visitFormDataRequest(value.value, visit)
          : undefined,
    });
  }

  public static visitHttpResponseBodyShape(
    bodyShape: APIV1Read.HttpResponseBodyShape,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    return visitDiscriminatedUnion(bodyShape)._visit({
      object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
      reference: (value) =>
        ApiTypeIdVisitor.visitTypeReference(value.value, visit),
      fileDownload: noop,
      streamingText: noop,
      stream: (value) =>
        ApiTypeIdVisitor.visitObjectOrReference(value.shape, visit),
      streamCondition: (value) => {
        ApiTypeIdVisitor.visitObjectOrReference(value.response.shape, visit);
        ApiTypeIdVisitor.visitObjectOrReference(
          value.streamResponse.shape,
          visit
        );
      },
    });
  }

  public static visitObjectOrReference(
    bodyShape: APIV1Read.JsonBodyShape,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    return visitDiscriminatedUnion(bodyShape)._visit({
      object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
      reference: (value) =>
        ApiTypeIdVisitor.visitTypeReference(value.value, visit),
    });
  }

  public static visitFormDataRequest(
    typeDefinition: APIV1Read.FormDataRequest,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    return typeDefinition.properties.forEach((property) =>
      visitDiscriminatedUnion(property)._visit({
        file: noop,
        bodyProperty: (bodyProperty) =>
          ApiTypeIdVisitor.visitTypeReference(bodyProperty.valueType, visit),
      })
    );
  }

  public static visitTypeDefinition(
    typeDefinition: APIV1Read.TypeDefinition,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    return ApiTypeIdVisitor.visitTypeShape(typeDefinition.shape, visit);
  }

  public static visitTypeShape(
    typeShape: APIV1Read.TypeShape,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    return visitDiscriminatedUnion(typeShape)._visit({
      object: (value) => ApiTypeIdVisitor.visitObjectType(value, visit),
      alias: (value) => ApiTypeIdVisitor.visitTypeReference(value.value, visit),
      enum: noop,
      undiscriminatedUnion: (value) =>
        value.variants.forEach((variant) =>
          ApiTypeIdVisitor.visitTypeReference(variant.type, visit)
        ),
      discriminatedUnion: (value) =>
        value.variants.forEach((variant) =>
          ApiTypeIdVisitor.visitObjectType(variant.additionalProperties, visit)
        ),
    });
  }

  public static visitObjectType(
    typeShape: APIV1Read.ObjectType,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    typeShape.extends.forEach(visit);
    typeShape.properties.forEach((property) => {
      ApiTypeIdVisitor.visitTypeReference(property.valueType, visit);
    });
  }

  public static visitTypeReference(
    typeReference: APIV1Read.TypeReference,
    visit: (typeId: APIV1Read.TypeId) => void
  ): void {
    return visitDiscriminatedUnion(typeReference)._visit({
      id: (value) => visit(value.value),
      primitive: noop,
      optional: (value) =>
        ApiTypeIdVisitor.visitTypeReference(value.itemType, visit),
      list: (value) =>
        ApiTypeIdVisitor.visitTypeReference(value.itemType, visit),
      set: (value) =>
        ApiTypeIdVisitor.visitTypeReference(value.itemType, visit),
      map: (value) => {
        ApiTypeIdVisitor.visitTypeReference(value.keyType, visit);
        ApiTypeIdVisitor.visitTypeReference(value.valueType, visit);
      },
      literal: noop,
      unknown: noop,
    });
  }
}
