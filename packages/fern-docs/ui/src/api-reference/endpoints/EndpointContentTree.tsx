import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { Badge, StatusCodeBadge, TooltipProvider } from "@fern-docs/components";
import { sortBy } from "es-toolkit/array";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { UnreachableCaseError } from "ts-essentials";
import { Markdown } from "../../mdx/Markdown";
import {
  AnchorIdProvider,
  SlugProvider,
  TypeDefinitionsProvider,
} from "../tree/contexts";
import { Tree } from "../tree/tree";
import { ObjectTypeShape, TypeShape } from "../tree/type-shape";
import { EndpointSection } from "./EndpointSection";

interface EndpointContentTreeProps {
  context: ApiDefinition.EndpointContext;
  showErrors: boolean;
}

export function EndpointContentTree({
  context: { endpoint, node, types, auth, globalHeaders },
  //   showErrors,
}: EndpointContentTreeProps) {
  const request = endpoint.requests?.[0];
  const response = endpoint.responses?.[0];

  const requestHeaders = [
    ...(auth ? [toAuthHeader(auth)] : []),
    ...globalHeaders,
    ...(endpoint.requestHeaders ?? []),
  ];

  if (request?.contentType) {
    requestHeaders.push({
      key: ApiDefinition.PropertyKey("Content-Type"),
      description: undefined,
      valueShape: {
        type: "alias",
        value: {
          type: "literal",
          value: {
            type: "stringLiteral",
            value: request.contentType,
          },
        },
      },
      availability: undefined,
    });
  }

  return (
    <SlugProvider value={node.slug}>
      <TypeDefinitionsProvider value={types}>
        <TooltipProvider>
          <div className="flex max-w-full flex-1 flex-col gap-12">
            <Markdown
              className="text-base leading-6"
              mdx={endpoint.description}
            />
            <AnchorIdProvider value="request">
              {requestHeaders.length > 0 && (
                <AnchorIdProvider value="headers">
                  <Tree.Root>
                    <EndpointSection
                      title="Headers"
                      anchorIdParts={["request", "headers"]}
                      slug={node.slug}
                      headerRight={
                        <Tree.HasDisclosures>
                          <Tree.ToggleExpandAll className="-mr-2" />
                        </Tree.HasDisclosures>
                      }
                    >
                      <ObjectTypeShape
                        shape={{
                          type: "object",
                          extends: [],
                          properties: sortBy(requestHeaders, [
                            (header) => header.availability === "Deprecated",
                          ]),
                          extraProperties: undefined,
                        }}
                      />
                    </EndpointSection>
                  </Tree.Root>
                </AnchorIdProvider>
              )}

              {endpoint.pathParameters &&
                endpoint.pathParameters.length > 0 && (
                  <AnchorIdProvider value="path">
                    <Tree.Root>
                      <EndpointSection
                        title="Path parameters"
                        anchorIdParts={["request", "path"]}
                        slug={node.slug}
                        headerRight={
                          <Tree.HasDisclosures>
                            <Tree.ToggleExpandAll className="-mr-2" />
                          </Tree.HasDisclosures>
                        }
                      >
                        <ObjectTypeShape
                          shape={{
                            type: "object",
                            extends: [],
                            properties: sortBy(endpoint.pathParameters, [
                              (parameter) =>
                                parameter.availability === "Deprecated",
                            ]),
                            extraProperties: undefined,
                          }}
                        />
                      </EndpointSection>
                    </Tree.Root>
                  </AnchorIdProvider>
                )}

              {endpoint.queryParameters &&
                endpoint.queryParameters.length > 0 && (
                  <AnchorIdProvider value="query">
                    <Tree.Root>
                      <EndpointSection
                        title="Query parameters"
                        anchorIdParts={["request", "query"]}
                        slug={node.slug}
                        headerRight={
                          <Tree.HasDisclosures>
                            <Tree.ToggleExpandAll className="-mr-2" />
                          </Tree.HasDisclosures>
                        }
                      >
                        <ObjectTypeShape
                          shape={{
                            type: "object",
                            extends: [],
                            properties: sortBy(endpoint.queryParameters, [
                              (parameter) =>
                                parameter.availability === "Deprecated",
                            ]),
                            extraProperties: undefined,
                          }}
                        />
                      </EndpointSection>
                    </Tree.Root>
                  </AnchorIdProvider>
                )}

              {request && (
                <Tree.Root>
                  <EndpointSection
                    title="Request"
                    anchorIdParts={["request"]}
                    slug={node.slug}
                    description={request.description}
                    headerRight={
                      <Tree.HasDisclosures>
                        <Tree.ToggleExpandAll className="-mr-2" />
                      </Tree.HasDisclosures>
                    }
                  >
                    {request.contentType && (
                      <Badge size="sm" className="mb-3 font-mono">
                        {request.contentType}
                      </Badge>
                    )}
                    <AnchorIdProvider value="body">
                      <HttpRequestBody body={request.body} />
                    </AnchorIdProvider>
                  </EndpointSection>
                </Tree.Root>
              )}
            </AnchorIdProvider>

            <AnchorIdProvider value="response">
              {response && (
                <Tree.Root>
                  <EndpointSection
                    title="Response"
                    anchorIdParts={["response"]}
                    slug={node.slug}
                    description={response.description}
                    headerRight={
                      <Tree.HasDisclosures>
                        <Tree.ToggleExpandAll className="-mr-2" />
                      </Tree.HasDisclosures>
                    }
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <StatusCodeBadge
                        statusCode={response.statusCode}
                        variant="subtle"
                        size="sm"
                      />
                      <HttpResponseContentTypeBadge
                        body={response.body}
                        variant="subtle"
                        size="sm"
                      />
                    </div>
                    <AnchorIdProvider value="body">
                      <HttpResponseBody
                        key={response.statusCode}
                        body={response.body}
                      />
                    </AnchorIdProvider>
                  </EndpointSection>
                </Tree.Root>
              )}
            </AnchorIdProvider>
          </div>
        </TooltipProvider>
      </TypeDefinitionsProvider>
    </SlugProvider>
  );
}

function HttpRequestBody({
  body,
}: {
  body: ApiDefinition.HttpRequestBodyShape;
}) {
  switch (body.type) {
    case "bytes":
      return false;
    case "formData":
      return false;
    case "object":
    case "alias":
      return <TypeShape shape={body} />;
    default:
      console.error(new UnreachableCaseError(body));
      return false;
  }
}

function HttpResponseBody({
  body,
}: {
  body: ApiDefinition.HttpResponseBodyShape;
}) {
  switch (body.type) {
    case "fileDownload":
    case "streamingText":
      return false;
    case "stream":
      return <TypeShape shape={body.shape} />;
    case "object":
    case "alias":
      return <TypeShape shape={body} />;
    default:
      console.error(new UnreachableCaseError(body));
      return false;
  }
}

const HttpResponseContentTypeBadge = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof Badge> & {
    body: ApiDefinition.HttpResponseBodyShape;
  }
>(({ body, ...props }, ref) => {
  switch (body.type) {
    case "object":
    case "alias":
      return (
        <Badge size="sm" className="font-mono" ref={ref} {...props}>
          application/json
        </Badge>
      );
    case "fileDownload":
      return (
        <Badge size="sm" className="font-mono" ref={ref} {...props}>
          application/octet-stream
        </Badge>
      );
    case "streamingText":
      return (
        <Badge size="sm" className="font-mono" ref={ref} {...props}>
          text/plain
        </Badge>
      );
    case "stream":
      return (
        <Badge size="sm" className="font-mono" ref={ref} {...props}>
          text/event-stream
        </Badge>
      );
    default:
      console.error(new UnreachableCaseError(body));
      return false;
  }
});

HttpResponseContentTypeBadge.displayName = "HttpResponseContentTypeBadge";

function toAuthHeader(
  auth: ApiDefinition.AuthScheme
): ApiDefinition.ObjectProperty {
  const stringShape: ApiDefinition.TypeShape = {
    type: "alias",
    value: {
      type: "primitive",
      value: {
        type: "string",
        regex: undefined,
        minLength: undefined,
        maxLength: undefined,
        default: undefined,
      },
    },
  };
  return visitDiscriminatedUnion(auth)._visit<ApiDefinition.ObjectProperty>({
    basicAuth: () => {
      return {
        key: ApiDefinition.PropertyKey("Authorization"),
        description:
          "Basic authentication of the form Basic <username:password>.",
        hidden: false,
        valueShape: stringShape,
        availability: undefined,
      };
    },
    bearerAuth: () => {
      return {
        key: ApiDefinition.PropertyKey("Authorization"),
        description:
          "Bearer authentication of the form Bearer <token>, where token is your auth token.",
        hidden: false,
        valueShape: stringShape,
        availability: undefined,
      };
    },
    header: (value) => {
      return {
        key: ApiDefinition.PropertyKey(value.headerWireValue),
        description:
          value.prefix != null
            ? `Header authentication of the form ${value.prefix} <token>`
            : undefined,
        hidden: false,
        valueShape: stringShape,
        availability: undefined,
      };
    },
    oAuth: (value) => {
      return visitDiscriminatedUnion(value.value, "type")._visit({
        clientCredentials: (clientCredentialsValue) =>
          visitDiscriminatedUnion(clientCredentialsValue.value, "type")._visit({
            referencedEndpoint: () => ({
              key: ApiDefinition.PropertyKey(
                clientCredentialsValue.value.headerName || "Authorization"
              ),
              description:
                "Bearer authentication of the form Bearer <token>, where token is your auth token.",
              hidden: false,
              valueShape: stringShape,
              availability: undefined,
            }),
          }),
      });
    },
  });
}
