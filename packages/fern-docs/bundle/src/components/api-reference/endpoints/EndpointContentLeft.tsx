import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";

import { MdxSerializer } from "@/server/mdx-serializer";

import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { EndpointErrorGroup } from "./EndpointErrorGroup";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointRequestSection } from "./EndpointRequestSection";
import { EndpointResponseSection } from "./EndpointResponseSection";
import { EndpointSection } from "./EndpointSection";

export interface HoveringProps {
  isHovering: boolean;
}

export declare namespace EndpointContentLeft {
  export interface Props {
    context: EndpointContext;
    showErrors: boolean;
  }
}

const REQUEST = ["request"];
const RESPONSE = ["response"];
const REQUEST_PATH = ["request", "path"];
const REQUEST_QUERY = ["request", "query"];
const REQUEST_HEADER = ["request", "header"];
const REQUEST_BODY = ["request", "body"];
const RESPONSE_BODY = ["response", "body"];
const RESPONSE_ERROR = ["response", "error"];

export async function EndpointContentLeft({
  serialize,
  context: { node, endpoint, types, auth, globalHeaders },
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
      {endpoint.pathParameters && endpoint.pathParameters.length > 0 && (
        <EndpointSection
          title="Path parameters"
          anchorIdParts={REQUEST_PATH}
          slug={node.slug}
        >
          {endpoint.pathParameters.map((parameter) => (
            <div key={parameter.key}>
              <TypeComponentSeparator />
              <EndpointParameter
                serialize={serialize}
                name={parameter.key}
                shape={parameter.valueShape}
                anchorIdParts={[...REQUEST_PATH, parameter.key]}
                slug={node.slug}
                description={parameter.description}
                additionalDescriptions={
                  ApiDefinition.unwrapReference(parameter.valueShape, types)
                    .descriptions
                }
                availability={parameter.availability}
                types={types}
              />
            </div>
          ))}
        </EndpointSection>
      )}
      {headers.length > 0 && (
        <EndpointSection
          title="Headers"
          anchorIdParts={REQUEST_HEADER}
          slug={node.slug}
        >
          {headers.map((parameter) => {
            let isAuth = false;
            if (
              (auth?.type === "header" &&
                parameter.key === auth?.headerWireValue) ||
              parameter.key === "Authorization"
            ) {
              isAuth = true;
            }

            return (
              <div key={parameter.key} className="relative">
                {isAuth && (
                  <div className="absolute top-3 right-0">
                    <div className="bg-tag-danger flex h-5 items-center rounded-xl px-2">
                      <span className="text-intent-danger text-xs">Auth</span>
                    </div>
                  </div>
                )}
                <TypeComponentSeparator />
                <EndpointParameter
                  serialize={serialize}
                  name={parameter.key}
                  shape={parameter.valueShape}
                  anchorIdParts={[...REQUEST_HEADER, parameter.key]}
                  slug={node.slug}
                  description={parameter.description}
                  additionalDescriptions={
                    ApiDefinition.unwrapReference(parameter.valueShape, types)
                      .descriptions
                  }
                  availability={parameter.availability}
                  types={types}
                />
              </div>
            );
          })}
        </EndpointSection>
      )}
      {endpoint.queryParameters && endpoint.queryParameters.length > 0 && (
        <EndpointSection
          title="Query parameters"
          anchorIdParts={REQUEST_QUERY}
          slug={node.slug}
        >
          {endpoint.queryParameters.map((parameter) => (
            <div key={parameter.key}>
              <TypeComponentSeparator />
              <EndpointParameter
                serialize={serialize}
                name={parameter.key}
                shape={parameter.valueShape}
                anchorIdParts={[...REQUEST_QUERY, parameter.key]}
                slug={node.slug}
                description={parameter.description}
                additionalDescriptions={
                  ApiDefinition.unwrapReference(parameter.valueShape, types)
                    .descriptions
                }
                availability={parameter.availability}
                types={types}
              />
            </div>
          ))}
        </EndpointSection>
      )}
      {endpoint.requests?.[0] != null && (
        <EndpointSection
          key={endpoint.requests[0].contentType}
          title="Request"
          anchorIdParts={REQUEST}
          slug={node.slug}
        >
          <EndpointRequestSection
            serialize={serialize}
            request={endpoint.requests[0]}
            anchorIdParts={REQUEST_BODY}
            slug={node.slug}
            types={types}
          />
        </EndpointSection>
      )}
      {endpoint.responses?.[0] != null && (
        <EndpointSection
          title="Response"
          anchorIdParts={RESPONSE}
          slug={node.slug}
        >
          <EndpointResponseSection
            serialize={serialize}
            response={endpoint.responses[0]}
            anchorIdParts={RESPONSE_BODY}
            slug={node.slug}
            types={types}
          />
        </EndpointSection>
      )}
      {showErrors && endpoint.errors && endpoint.errors.length > 0 && (
        <EndpointSection
          title="Errors"
          anchorIdParts={RESPONSE_ERROR}
          slug={node.slug}
        >
          <EndpointErrorGroup
            serialize={serialize}
            anchorIdParts={RESPONSE_ERROR}
            slug={node.slug}
            errors={endpoint.errors}
            types={types}
          />
        </EndpointSection>
      )}
    </>
  );
}
