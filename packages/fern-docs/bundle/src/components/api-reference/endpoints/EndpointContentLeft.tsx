import "server-only";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { MdxServerComponentProseSuspense } from "@/components/mdx/server-component";
import { MdxSerializer } from "@/server/mdx-serializer";

import { ObjectProperty } from "../type-definitions/ObjectProperty";
import {
  TypeDefinitionAnchorPart,
  TypeDefinitionResponse,
} from "../type-definitions/TypeDefinitionContext";
import { WithSeparator } from "../type-definitions/TypeDefinitionDetails";
import { EndpointErrorGroup } from "./EndpointErrorGroup";
import {
  EndpointRequestSection,
  createEndpointRequestDescriptionFallback,
} from "./EndpointRequestSection";
import { EndpointResponseSection } from "./EndpointResponseSection";
import { EndpointSection } from "./EndpointSection";
import { ResponseSummaryFallback } from "./response-summary-fallback";

export interface HoveringProps {
  isHovering: boolean;
}

export async function EndpointContentLeft({
  serialize,
  context: { endpoint, types, auth, globalHeaders },
  showAuth,
  showErrors,
}: {
  serialize: MdxSerializer;
  context: EndpointContext;
  showAuth: boolean;
  showErrors: boolean;
}) {
  let authHeader: ApiDefinition.ObjectProperty | undefined;
  if (auth && showAuth) {
    const stringShape: ApiDefinition.TypeShape = {
      type: "alias",
      value: {
        type: "primitive",
        value: {
          type: "string",
          format: undefined,
          regex: undefined,
          minLength: undefined,
          maxLength: undefined,
          default: undefined,
        },
      },
    };
    authHeader = visitDiscriminatedUnion(
      auth
    )._visit<ApiDefinition.ObjectProperty>({
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
            visitDiscriminatedUnion(
              clientCredentialsValue.value,
              "type"
            )._visit({
              referencedEndpoint: () => ({
                key: ApiDefinition.PropertyKey(
                  clientCredentialsValue.value.headerName || "Authorization"
                ),
                description: `OAuth authentication of the form ${clientCredentialsValue.value.tokenPrefix ? `${clientCredentialsValue.value.tokenPrefix ?? "Bearer"} ` : ""}<token>.`,
                hidden: false,
                valueShape: stringShape,
                availability: undefined,
              }),
            }),
        });
      },
    });
  }

  const headers = [
    ...(authHeader ? [authHeader] : []),
    ...globalHeaders,
    ...(endpoint.requestHeaders ?? []),
  ];

  return (
    <>
      <TypeDefinitionAnchorPart part="request">
        {endpoint.pathParameters && endpoint.pathParameters.length > 0 && (
          <TypeDefinitionAnchorPart part="path">
            <EndpointSection title="Path parameters">
              <WithSeparator>
                {endpoint.pathParameters.map((parameter) => (
                  <TypeDefinitionAnchorPart
                    key={parameter.key}
                    part={parameter.key}
                  >
                    <ObjectProperty
                      serialize={serialize}
                      property={parameter}
                      types={types}
                    />
                  </TypeDefinitionAnchorPart>
                ))}
              </WithSeparator>
            </EndpointSection>
          </TypeDefinitionAnchorPart>
        )}
        {headers.length > 0 && (
          <TypeDefinitionAnchorPart part="header">
            <EndpointSection title="Headers">
              <WithSeparator>
                {headers.map((parameter) => {
                  let isAuth = false;
                  if (
                    (auth?.type === "header" &&
                      parameter.key === auth?.headerWireValue) ||
                    parameter.key === "Authorization"
                  ) {
                    isAuth = true;
                  }

                  // {isAuth && (
                  //   <div className="absolute right-0 top-3">
                  //     <div className="bg-(color:--red-a3) flex h-5 items-center rounded-3 px-2">
                  //       <span className="text-(color:--red-a11) text-xs">Auth</span>
                  //     </div>
                  //   </div>
                  // )}

                  return (
                    <TypeDefinitionAnchorPart
                      key={parameter.key}
                      part={parameter.key}
                    >
                      <ObjectProperty
                        serialize={serialize}
                        property={parameter}
                        types={types}
                      />
                    </TypeDefinitionAnchorPart>
                  );
                })}
              </WithSeparator>
            </EndpointSection>
          </TypeDefinitionAnchorPart>
        )}
        {endpoint.queryParameters && endpoint.queryParameters.length > 0 && (
          <TypeDefinitionAnchorPart part="query">
            <EndpointSection title="Query parameters">
              <WithSeparator>
                {endpoint.queryParameters.map((parameter) => (
                  <TypeDefinitionAnchorPart
                    key={parameter.key}
                    part={parameter.key}
                  >
                    <ObjectProperty
                      serialize={serialize}
                      property={parameter}
                      types={types}
                    />
                  </TypeDefinitionAnchorPart>
                ))}
              </WithSeparator>
            </EndpointSection>
          </TypeDefinitionAnchorPart>
        )}
        {endpoint.requests?.[0] != null && (
          <EndpointSection
            title="Request"
            description={
              <MdxServerComponentProseSuspense
                serialize={serialize}
                size="sm"
                className="text-(color:--grayscale-a11)"
                mdx={endpoint.requests[0].description}
                fallback={createEndpointRequestDescriptionFallback(
                  endpoint.requests[0],
                  types
                )}
              />
            }
          >
            <TypeDefinitionAnchorPart part="body">
              <EndpointRequestSection
                serialize={serialize}
                request={endpoint.requests[0]}
                types={types}
              />
            </TypeDefinitionAnchorPart>
          </EndpointSection>
        )}
      </TypeDefinitionAnchorPart>
      <TypeDefinitionResponse>
        <TypeDefinitionAnchorPart part="response">
          {endpoint.responses?.[0] != null && (
            <EndpointSection
              title="Response"
              description={
                <MdxServerComponentProseSuspense
                  serialize={serialize}
                  size="sm"
                  className="text-(color:--grayscale-a11)"
                  mdx={endpoint.responses[0].description}
                  fallback={
                    <ResponseSummaryFallback
                      response={endpoint.responses[0]}
                      types={types}
                    />
                  }
                />
              }
            >
              <TypeDefinitionAnchorPart part="body">
                <EndpointResponseSection
                  serialize={serialize}
                  body={endpoint.responses[0].body}
                  types={types}
                />
              </TypeDefinitionAnchorPart>
            </EndpointSection>
          )}
          {showErrors && endpoint.errors && endpoint.errors.length > 0 && (
            <TypeDefinitionAnchorPart part="error">
              <EndpointSection title="Errors" hideSeparator>
                <EndpointErrorGroup
                  serialize={serialize}
                  errors={endpoint.errors}
                  types={types}
                />
              </EndpointSection>
            </TypeDefinitionAnchorPart>
          )}
        </TypeDefinitionAnchorPart>
      </TypeDefinitionResponse>
    </>
  );
}
