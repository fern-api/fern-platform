import * as Latest from "./latest";
import { Transformer } from "./transformer";

interface EndpointDefinitionVisitor {
  EndpointDefinition: (endpoint: Latest.EndpointDefinition) => void;
  HttpRequest: (request: Latest.HttpRequest) => void;
  HttpResponse: (response: Latest.HttpResponse) => void;
  ErrorResponse: (error: Latest.ErrorResponse) => void;
  ExampleEndpointCall: (example: Latest.ExampleEndpointCall) => void;
  CodeSnippet: (snippet: Latest.CodeSnippet) => void;
  ErrorExample: (error: Latest.ErrorExample) => void;
}

export function visitEndpointDefinition(
  endpoint: Latest.EndpointDefinition,
  visitor: EndpointDefinitionVisitor
): void {
  Transformer.with({
    EndpointDefinition: (endpoint) => {
      visitor.EndpointDefinition(endpoint);
      return endpoint;
    },
    HttpRequest: (request) => {
      visitor.HttpRequest(request);
      return request;
    },
    HttpResponse: (response) => {
      visitor.HttpResponse(response);
      return response;
    },
    ErrorResponse: (error) => {
      visitor.ErrorResponse(error);
      return error;
    },
    ExampleEndpointCall: (example) => {
      visitor.ExampleEndpointCall(example);
      return example;
    },
    CodeSnippet: (snippet) => {
      visitor.CodeSnippet(snippet);
      return snippet;
    },
    ErrorExample: (error) => {
      visitor.ErrorExample(error);
      return error;
    },
  }).endpoint(endpoint, "");
}

interface WebhookDefinitionVisitor {
  WebhookDefinition: (webhook: Latest.WebhookDefinition) => void;
  WebhookPayload: (payload: Latest.WebhookPayload) => void;
}

export function visitWebhookDefinition(
  webhook: Latest.WebhookDefinition,
  visitor: WebhookDefinitionVisitor
): void {
  Transformer.with({
    WebhookDefinition: (webhook) => {
      visitor.WebhookDefinition(webhook);
      return webhook;
    },
    WebhookPayload: (payload) => {
      visitor.WebhookPayload(payload);
      return payload;
    },
  }).webhookDefinition(webhook, "");
}

interface WebSocketChannelVisitor {
  WebSocketChannel: (channel: Latest.WebSocketChannel) => void;
  WebSocketMessage: (message: Latest.WebSocketMessage) => void;
  ExampleWebSocketSession: (session: Latest.ExampleWebSocketSession) => void;
}

export function visitWebSocketChannel(
  channel: Latest.WebSocketChannel,
  visitor: WebSocketChannelVisitor
): void {
  Transformer.with({
    WebSocketChannel: (channel) => {
      visitor.WebSocketChannel(channel);
      return channel;
    },
    WebSocketMessage: (message) => {
      visitor.WebSocketMessage(message);
      return message;
    },
    ExampleWebSocketSession: (session) => {
      visitor.ExampleWebSocketSession(session);
      return session;
    },
  }).webSocketChannel(channel, "");
}
