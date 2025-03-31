import identity from "@fern-api/ui-core-utils/identity";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";

import * as Latest from "./latest";

/**
 * Visitor for API definitions.
 * This is used to traverse the API definition and apply functions to each node.
 */
export interface ApiDefinitionVisitor {
  // endpoints
  EndpointDefinition(
    endpoint: Latest.EndpointDefinition,
    key: string
  ): Latest.EndpointDefinition;
  HttpRequest(request: Latest.HttpRequest, key: string): Latest.HttpRequest;
  HttpResponse(response: Latest.HttpResponse, key: string): Latest.HttpResponse;
  ErrorResponse(error: Latest.ErrorResponse, key: string): Latest.ErrorResponse;
  ExampleEndpointCall(
    example: Latest.ExampleEndpointCall,
    key: string
  ): Latest.ExampleEndpointCall;
  CodeSnippet(snippet: Latest.CodeSnippet, key: string): Latest.CodeSnippet;
  ErrorExample(error: Latest.ErrorExample, key: string): Latest.ErrorExample;

  // webhooks
  WebhookDefinition(
    webhook: Latest.WebhookDefinition,
    key: string
  ): Latest.WebhookDefinition;
  WebhookPayload(
    payload: Latest.WebhookPayload,
    key: string
  ): Latest.WebhookPayload;

  // websockets
  WebSocketChannel(
    channel: Latest.WebSocketChannel,
    key: string
  ): Latest.WebSocketChannel;
  WebSocketMessage(
    message: Latest.WebSocketMessage,
    key: string
  ): Latest.WebSocketMessage;
  ExampleWebSocketSession(
    session: Latest.ExampleWebSocketSession,
    key: string
  ): Latest.ExampleWebSocketSession;

  // types
  TypeDefinition(
    type: Latest.TypeDefinition,
    key: string
  ): Latest.TypeDefinition;
  TypeShape(shape: Latest.TypeShape, key: string): Latest.TypeShape;
  ObjectType(property: Latest.ObjectType, key: string): Latest.ObjectType;
  ObjectProperty(
    property: Latest.ObjectProperty,
    key: string
  ): Latest.ObjectProperty;
  EnumValue(value: Latest.EnumValue, key: string): Latest.EnumValue;
  UndiscriminatedUnionVariant(
    variant: Latest.UndiscriminatedUnionVariant,
    key: string
  ): Latest.UndiscriminatedUnionVariant;
  DiscriminatedUnionVariant(
    variant: Latest.DiscriminatedUnionVariant,
    key: string
  ): Latest.DiscriminatedUnionVariant;
  FormDataRequest(
    request: Latest.FormDataRequest,
    key: string
  ): Latest.FormDataRequest;
  FormDataField(field: Latest.FormDataField, key: string): Latest.FormDataField;
  FormDataFile(file: Latest.FormDataFile, key: string): Latest.FormDataFile;
  FormDataFiles(files: Latest.FormDataFiles, key: string): Latest.FormDataFiles;
}

export class Transformer {
  public static with(visitor: Partial<ApiDefinitionVisitor>): Transformer {
    return new Transformer({
      EndpointDefinition: visitor.EndpointDefinition ?? identity,
      HttpRequest: visitor.HttpRequest ?? identity,
      HttpResponse: visitor.HttpResponse ?? identity,
      ErrorResponse: visitor.ErrorResponse ?? identity,
      ExampleEndpointCall: visitor.ExampleEndpointCall ?? identity,
      CodeSnippet: visitor.CodeSnippet ?? identity,
      ErrorExample: visitor.ErrorExample ?? identity,
      WebhookDefinition: visitor.WebhookDefinition ?? identity,
      WebhookPayload: visitor.WebhookPayload ?? identity,
      WebSocketChannel: visitor.WebSocketChannel ?? identity,
      WebSocketMessage: visitor.WebSocketMessage ?? identity,
      ExampleWebSocketSession: visitor.ExampleWebSocketSession ?? identity,
      TypeDefinition: visitor.TypeDefinition ?? identity,
      TypeShape: visitor.TypeShape ?? identity,
      ObjectType: visitor.ObjectType ?? identity,
      ObjectProperty: visitor.ObjectProperty ?? identity,
      EnumValue: visitor.EnumValue ?? identity,
      UndiscriminatedUnionVariant:
        visitor.UndiscriminatedUnionVariant ?? identity,
      DiscriminatedUnionVariant: visitor.DiscriminatedUnionVariant ?? identity,
      FormDataRequest: visitor.FormDataRequest ?? identity,
      FormDataField: visitor.FormDataField ?? identity,
      FormDataFile: visitor.FormDataFile ?? identity,
      FormDataFiles: visitor.FormDataFiles ?? identity,
    });
  }

  public static descriptions(
    transformer: (description: string, key: string) => string
  ): Transformer {
    function internalTransformer<T extends Latest.WithDescription>(
      withDescription: T,
      key: string
    ): T {
      const description =
        withDescription.description != null
          ? transformer(withDescription.description, key)
          : undefined;
      return { ...withDescription, description };
    }

    return Transformer.with({
      EndpointDefinition: internalTransformer,
      HttpRequest: internalTransformer,
      HttpResponse: internalTransformer,
      ErrorResponse: internalTransformer,
      ExampleEndpointCall: internalTransformer,
      CodeSnippet: internalTransformer,
      ErrorExample: internalTransformer,
      WebhookDefinition: internalTransformer,
      WebhookPayload: internalTransformer,
      WebSocketChannel: internalTransformer,
      WebSocketMessage: internalTransformer,
      ExampleWebSocketSession: internalTransformer,
      TypeDefinition: internalTransformer,
      ObjectProperty: internalTransformer,
      EnumValue: internalTransformer,
      UndiscriminatedUnionVariant: internalTransformer,
      DiscriminatedUnionVariant: internalTransformer,
      FormDataRequest: internalTransformer,
      FormDataField: internalTransformer,
      FormDataFile: internalTransformer,
      FormDataFiles: internalTransformer,
    });
  }

  /**
   * @internal visible for testing only
   */
  public static keys(collect: (key: string) => void): Transformer {
    function visit<T>(value: T, key: string): T {
      collect(key);
      return value;
    }
    return Transformer.with({
      EndpointDefinition: visit,
      HttpRequest: visit,
      HttpResponse: visit,
      ErrorResponse: visit,
      ExampleEndpointCall: visit,
      CodeSnippet: visit,
      ErrorExample: visit,
      WebhookDefinition: visit,
      WebhookPayload: visit,
      WebSocketChannel: visit,
      WebSocketMessage: visit,
      ExampleWebSocketSession: visit,
      TypeDefinition: visit,
      TypeShape: visit,
      ObjectType: visit,
      ObjectProperty: visit,
      EnumValue: visit,
      UndiscriminatedUnionVariant: visit,
      DiscriminatedUnionVariant: visit,
      FormDataRequest: visit,
      FormDataField: visit,
      FormDataFile: visit,
      FormDataFiles: visit,
    });
  }

  private visitor: ApiDefinitionVisitor;
  private constructor(visitor: ApiDefinitionVisitor) {
    this.visitor = this.#wrapVisitor(visitor);
  }

  /**
   * Visits an API definition and applies the visitor transformations to each node.
   *
   * This function treats the API Definition as an AST. The purpose is to apply transformations to the "description" field of each node.
   *
   * @param api the API definition to visit
   * @param visitor the visitor to apply to the API definition
   * @returns the API definition with the visitor transformations applied
   */
  apiDefinition = (api: Latest.ApiDefinition): Latest.ApiDefinition => {
    const endpoints = Object.entries(api.endpoints).map(([id, endpoint]) => [
      id,
      this.visitor.EndpointDefinition(endpoint, `${api.id}/endpoint/${id}`),
    ]);

    const websockets = Object.entries(api.websockets).map(([id, websocket]) => [
      id,
      this.visitor.WebSocketChannel(websocket, `${api.id}/websocket/${id}`),
    ]);

    const webhooks = Object.entries(api.webhooks).map(([id, webhook]) => [
      id,
      this.visitor.WebhookDefinition(webhook, `${api.id}/webhoook/${id}`),
    ]);

    const types = Object.entries(api.types).map(([id, type]) => [
      id,
      this.visitor.TypeDefinition(type, `${api.id}/type-definition/${id}`),
    ]);

    const globalHeaders =
      api.globalHeaders?.map((header) =>
        this.visitor.ObjectProperty(
          header,
          `${api.id}/global-headers/${header.key}`
        )
      ) ?? [];

    return {
      id: api.id,
      endpoints: Object.fromEntries(endpoints),
      websockets: Object.fromEntries(websockets),
      webhooks: Object.fromEntries(webhooks),
      types: Object.fromEntries(types),
      globalHeaders,
      auths: api.auths,
      subpackages: api.subpackages,
      snippetsConfiguration: api.snippetsConfiguration,
    };
  };

  #wrapVisitor = (visitor: ApiDefinitionVisitor): ApiDefinitionVisitor => {
    const innerVisitor: ApiDefinitionVisitor = {
      /**
       * The following types do not have any nested types that need to be visited.
       */

      CodeSnippet: visitor.CodeSnippet,
      ErrorExample: visitor.ErrorExample,
      ExampleWebSocketSession: visitor.ExampleWebSocketSession,
      ObjectProperty: visitor.ObjectProperty,
      EnumValue: visitor.EnumValue,
      UndiscriminatedUnionVariant: visitor.UndiscriminatedUnionVariant,
      FormDataFile: visitor.FormDataFile,
      FormDataFiles: visitor.FormDataFiles,

      /**
       * The following types have nested types that need to be visited.
       */

      EndpointDefinition: (endpoint, key) =>
        visitor.EndpointDefinition(this.endpoint(endpoint, key), key),
      HttpRequest: (request, key) =>
        visitor.HttpRequest(this.httpRequest(request, key), key),
      HttpResponse: (response, key) =>
        visitor.HttpResponse(this.httpResponse(response, key), key),
      ErrorResponse: (error, key) =>
        visitor.ErrorResponse(this.errorResponse(error, key), key),
      ExampleEndpointCall: (example, key) =>
        visitor.ExampleEndpointCall(
          this.exampleEndpointCall(example, key),
          key
        ),
      WebhookDefinition: (webhook, key) =>
        visitor.WebhookDefinition(this.webhookDefinition(webhook, key), key),
      WebhookPayload: (payload, key) =>
        visitor.WebhookPayload(this.webhookPayload(payload, key), key),
      WebSocketChannel: (channel, key) =>
        visitor.WebSocketChannel(this.webSocketChannel(channel, key), key),
      WebSocketMessage: (message, key) =>
        visitor.WebSocketMessage(this.webSocketMessage(message, key), key),
      TypeDefinition: (type, key) =>
        visitor.TypeDefinition(this.typeDefinition(type, key), key),
      TypeShape: (shape, key) =>
        visitor.TypeShape(this.typeShape(shape, key), key),
      ObjectType: (type, key) =>
        visitor.ObjectType(this.objectType(type, key), key),
      DiscriminatedUnionVariant: (variant, key) =>
        visitor.DiscriminatedUnionVariant(this.objectType(variant, key), key),
      FormDataRequest: (request, key) =>
        visitor.FormDataRequest(this.formDataRequest(request, key), key),
      FormDataField: (field, key) =>
        visitor.FormDataField(this.formDataField(field, key), key),
    };
    return innerVisitor;
  };

  endpoint = (
    endpoint: Latest.EndpointDefinition,
    parentKey: string
  ): Latest.EndpointDefinition => {
    const pathParameters =
      endpoint.pathParameters?.map((param) =>
        this.visitor.ObjectProperty(param, `${parentKey}/path/${param.key}`)
      ) ?? [];
    const queryParameters =
      endpoint.queryParameters?.map((param) =>
        this.visitor.ObjectProperty(param, `${parentKey}/query/${param.key}`)
      ) ?? [];
    const requestHeaders =
      endpoint.requestHeaders?.map((param) =>
        this.visitor.ObjectProperty(
          param,
          `${parentKey}/requestHeader/${param.key}`
        )
      ) ?? [];
    const responseHeaders =
      endpoint.responseHeaders?.map((param) =>
        this.visitor.ObjectProperty(
          param,
          `${parentKey}/responseHeader/${param.key}`
        )
      ) ?? [];
    const requests = endpoint.requests?.map((request, i) =>
      // this has changed
      this.visitor.HttpRequest(request, `${parentKey}/request/${i}`)
    );
    const responses = endpoint.responses?.map((response, i) =>
      // this has changed discretely
      this.visitor.HttpResponse(
        response,
        `${parentKey}/response/${i}/${response.statusCode}`
      )
    );
    const errors =
      endpoint.errors?.map((error, i) =>
        this.visitor.ErrorResponse(
          error,
          `${parentKey}/error/${i}/${error.statusCode}`
        )
      ) ?? [];
    const examples =
      endpoint.examples?.map((example, i) =>
        this.visitor.ExampleEndpointCall(example, `${parentKey}/example/${i}`)
      ) ?? [];

    return {
      ...endpoint,
      pathParameters: pathParameters.length > 0 ? pathParameters : undefined,
      queryParameters: queryParameters.length > 0 ? queryParameters : undefined,
      requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
      responseHeaders: responseHeaders.length > 0 ? responseHeaders : undefined,
      requests,
      responses,
      errors: errors.length > 0 ? errors : undefined,
      examples: examples.length > 0 ? examples : undefined,
    };
  };

  httpRequest = (
    request: Latest.HttpRequest,
    parentKey: string
  ): Latest.HttpRequest => {
    const body = visitDiscriminatedUnion(
      request.body
    )._visit<Latest.HttpRequestBodyShape>({
      object: (value) => ({
        ...value,
        ...this.visitor.ObjectType(value, `${parentKey}/object`),
      }),
      alias: identity,
      bytes: identity,
      formData: (value) => ({
        ...value,
        ...this.visitor.FormDataRequest(value, `${parentKey}/formdata`),
      }),
    });
    return { ...request, body };
  };

  formDataField = (
    field: Latest.FormDataField,
    parentKey: string
  ): Latest.FormDataField => {
    return visitDiscriminatedUnion(field)._visit<Latest.FormDataField>({
      file: (value) => ({
        ...value,
        ...this.visitor.FormDataFile(value, `${parentKey}/file/${value.key}`),
      }),
      files: (value) => ({
        ...value,
        ...this.visitor.FormDataFiles(value, `${parentKey}/files/${value.key}`),
      }),
      property: (value) => ({
        ...value,
        ...this.visitor.ObjectProperty(
          value,
          `${parentKey}/property/${value.key}`
        ),
      }),
    });
  };

  httpResponse = (
    response: Latest.HttpResponse,
    parentKey: string
  ): Latest.HttpResponse => {
    const body = visitDiscriminatedUnion(
      response.body
    )._visit<Latest.HttpResponseBodyShape>({
      object: (value) => ({
        ...value,
        ...this.visitor.ObjectType(value, `${parentKey}/object`),
      }),
      alias: identity,
      fileDownload: identity,
      streamingText: identity,
      stream: (value) => ({
        ...value,
        shape: this.visitor.TypeShape(value.shape, `${parentKey}/stream/shape`),
      }),
      empty: identity,
    });
    return { ...response, body };
  };

  objectType = <T extends Latest.ObjectType>(type: T, parentKey: string): T => {
    const properties = type.properties.map((prop) =>
      this.visitor.ObjectProperty(prop, `${parentKey}/property/${prop.key}`)
    );
    return { ...type, properties };
  };

  errorResponse = (
    error: Latest.ErrorResponse,
    parentKey: string
  ): Latest.ErrorResponse => {
    const shape = error.shape
      ? this.visitor.TypeShape(error.shape, `${parentKey}/error/shape`)
      : undefined;
    const examples =
      error.examples?.map((example, i) =>
        this.visitor.ErrorExample(example, `${parentKey}/example/${i}`)
      ) ?? [];
    return {
      ...error,
      shape,
      examples: examples.length > 0 ? examples : undefined,
    };
  };

  exampleEndpointCall = (
    example: Latest.ExampleEndpointCall,
    parentKey: string
  ): Latest.ExampleEndpointCall => {
    const snippetsEntries = Object.entries(example.snippets ?? {})
      .map(
        ([language, snippets]) =>
          [
            language,
            snippets.map((snippet, i) =>
              this.visitor.CodeSnippet(
                snippet,
                `${parentKey}/snippet/${language}/${i}`
              )
            ),
          ] as const
      )
      .filter(([, snippets]) => snippets.length > 0);

    const snippets = Object.fromEntries(snippetsEntries);
    return {
      ...example,
      snippets: snippetsEntries.length > 0 ? snippets : undefined,
    };
  };

  webhookDefinition = (
    webhook: Latest.WebhookDefinition,
    parentKey: string
  ): Latest.WebhookDefinition => {
    const payload =
      webhook.payloads?.[0] != null
        ? this.visitor.WebhookPayload(
            webhook.payloads[0],
            `${parentKey}/payload`
          )
        : undefined;
    const headers =
      webhook.headers?.map((header) =>
        this.visitor.ObjectProperty(header, `${parentKey}/header/${header.key}`)
      ) ?? [];
    return {
      ...webhook,
      payloads: payload != null ? [payload] : undefined,
      headers: headers.length > 0 ? headers : undefined,
    };
  };

  webhookPayload = (
    payload: Latest.WebhookPayload,
    parentKey: string
  ): Latest.WebhookPayload => {
    const shape = this.visitor.TypeShape(payload.shape, `${parentKey}/shape`);
    return { ...payload, shape };
  };

  webSocketChannel = (
    channel: Latest.WebSocketChannel,
    parentKey: string
  ): Latest.WebSocketChannel => {
    const pathParameters =
      channel.pathParameters?.map((param) =>
        this.visitor.ObjectProperty(param, `${parentKey}/path/${param.key}`)
      ) ?? [];
    const queryParameters =
      channel.queryParameters?.map((param) =>
        this.visitor.ObjectProperty(param, `${parentKey}/query/${param.key}`)
      ) ?? [];
    const requestHeaders =
      channel.requestHeaders?.map((param) =>
        this.visitor.ObjectProperty(
          param,
          `${parentKey}/requestHeader/${param.key}`
        )
      ) ?? [];
    const messages = channel.messages.map((message) =>
      this.visitor.WebSocketMessage(
        message,
        `${parentKey}/message/${message.origin}/${message.type}`
      )
    );
    const examples =
      channel.examples?.map((example, i) =>
        this.visitor.ExampleWebSocketSession(
          example,
          `${parentKey}/example/${i}`
        )
      ) ?? [];
    return {
      ...channel,
      pathParameters: pathParameters.length > 0 ? pathParameters : undefined,
      queryParameters: queryParameters.length > 0 ? queryParameters : undefined,
      requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
      messages,
      examples: examples.length > 0 ? examples : undefined,
    };
  };

  webSocketMessage = (
    message: Latest.WebSocketMessage,
    parentKey: string
  ): Latest.WebSocketMessage => {
    const body = this.visitor.TypeShape(message.body, `${parentKey}/body`);
    return { ...message, body };
  };

  typeShape = (
    shape: Latest.TypeShape,
    parentKey: string
  ): Latest.TypeShape => {
    return visitDiscriminatedUnion(shape)._visit<Latest.TypeShape>({
      object: (value) => ({
        ...value,
        ...this.visitor.ObjectType(value, `${parentKey}/object`),
      }),
      alias: identity,
      enum: (value) => ({
        ...value,
        values: value.values.map((enumValue) =>
          this.visitor.EnumValue(
            enumValue,
            `${parentKey}/enum/value/${enumValue.value}`
          )
        ),
      }),
      undiscriminatedUnion: (value) => ({
        ...value,
        variants: value.variants.map((variant, i) =>
          this.visitor.UndiscriminatedUnionVariant(
            variant,
            `${parentKey}/undiscriminatedUnion/variant/${i}`
          )
        ),
      }),
      discriminatedUnion: (value) => ({
        ...value,
        variants: value.variants.map((variant) =>
          this.visitor.DiscriminatedUnionVariant(
            variant,
            `${parentKey}/discriminatedUnion/variant/${variant.discriminantValue}`
          )
        ),
      }),
    });
  };

  formDataRequest = (
    request: Latest.FormDataRequest,
    parentKey: string
  ): Latest.FormDataRequest => {
    return {
      ...request,
      fields: request.fields.map((field) =>
        this.visitor.FormDataField(field, `${parentKey}/field/${field.key}`)
      ),
    };
  };

  typeDefinition = (
    type: Latest.TypeDefinition,
    parentKey: string
  ): Latest.TypeDefinition => {
    return {
      ...type,
      shape: this.visitor.TypeShape(type.shape, `${parentKey}/shape`),
    };
  };
}
