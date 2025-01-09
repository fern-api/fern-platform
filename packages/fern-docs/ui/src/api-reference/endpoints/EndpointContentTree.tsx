import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { AvailabilityBadge } from "@fern-docs/components";
import { Parameter, Tree } from "@fern-docs/components/tree";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { UnreachableCaseError } from "ts-essentials";
import { useTypeShorthandLang } from "../../atoms";
import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthand } from "../../type-shorthand";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { HoveringProps } from "./EndpointContentLeft";
import { EndpointSection } from "./EndpointSection";
interface EndpointContentTreeProps {
  context: ApiDefinition.EndpointContext;
  showErrors: boolean;
  onHoverRequestProperty: (
    jsonPropertyPath: JsonPropertyPath,
    hovering: HoveringProps
  ) => void;
  onHoverResponseProperty: (
    jsonPropertyPath: JsonPropertyPath,
    hovering: HoveringProps
  ) => void;
}

export function EndpointContentTree({
  context: { endpoint, node, types, auth, globalHeaders },
  //   showErrors,
  //   onHoverRequestProperty,
  //   onHoverResponseProperty,
}: EndpointContentTreeProps) {
  const requestHeaders = [
    ...(auth ? [toAuthHeader(auth)] : []),
    ...globalHeaders,
    ...(endpoint.requestHeaders ?? []),
  ];

  return (
    <TooltipProvider>
      <div className="flex max-w-full flex-1 flex-col gap-12">
        <Markdown className="text-base leading-6" mdx={endpoint.description} />
        {requestHeaders.length > 0 && (
          <EndpointSection
            title="Headers"
            anchorIdParts={["request", "headers"]}
            slug={node.slug}
          >
            <Tree.Root>
              {requestHeaders.map((header) => (
                <ObjectProperty
                  key={header.key}
                  property={header}
                  types={types}
                />
              ))}
            </Tree.Root>
          </EndpointSection>
        )}

        {endpoint.pathParameters && endpoint.pathParameters.length > 0 && (
          <EndpointSection
            title="Path parameters"
            anchorIdParts={["request", "path"]}
            slug={node.slug}
          >
            <Tree.Root>
              {endpoint.pathParameters.map((parameter) => (
                <ObjectProperty
                  key={parameter.key}
                  property={parameter}
                  types={types}
                />
              ))}
            </Tree.Root>
          </EndpointSection>
        )}

        {endpoint.queryParameters && endpoint.queryParameters.length > 0 && (
          <EndpointSection
            title="Query parameters"
            anchorIdParts={["request", "query"]}
            slug={node.slug}
          >
            <Tree.Root>
              {endpoint.queryParameters.map((parameter) => (
                <ObjectProperty
                  key={parameter.key}
                  property={parameter}
                  types={types}
                />
              ))}
            </Tree.Root>
          </EndpointSection>
        )}

        {endpoint.requests?.[0] && (
          <EndpointSection
            title="Request"
            anchorIdParts={["request"]}
            slug={node.slug}
            description={endpoint.requests[0].description}
          >
            <Tree.Root>
              <HttpRequestBody body={endpoint.requests[0].body} types={types} />
            </Tree.Root>
          </EndpointSection>
        )}

        {endpoint.responses && endpoint.responses?.length > 0 && (
          <EndpointSection
            title="Response"
            anchorIdParts={["response"]}
            slug={node.slug}
          >
            <Tree.Root>
              {endpoint.responses.map((response) => (
                <div key={response.statusCode}>{response.statusCode}</div>
              ))}
            </Tree.Root>
          </EndpointSection>
        )}
      </div>
    </TooltipProvider>
  );
}

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

function ObjectProperty({
  property,
  types,
}: {
  property: ApiDefinition.ObjectProperty;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
  return (
    <Tree.Item>
      <Tree.Summary>
        <Tree.Trigger>
          <Parameter.Root>
            <Parameter.Name parameterName={property.key} />
            <span className="text-xs text-[var(--grayscale-a9)]">
              <TypeShorthand shape={unwrapped.shape} types={types} />
            </span>
            <Parameter.Spacer />
            {unwrapped.availability && (
              <AvailabilityBadge
                availability={unwrapped.availability}
                size="sm"
              />
            )}
            <Parameter.Status
              status={!unwrapped.isOptional ? "required" : "optional"}
            />
          </Parameter.Root>
        </Tree.Trigger>
        <Markdown
          size="sm"
          className="text-text-muted leading-snug"
          mdx={property.description ?? unwrapped.descriptions[0]}
        />
      </Tree.Summary>
      {renderObjectPropertyContent(unwrapped.shape, types)}
    </Tree.Item>
  );
}

function renderObjectPropertyContent(
  property: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference,
  types: Record<string, ApiDefinition.TypeDefinition>
) {
  switch (property.type) {
    case "literal":
    case "primitive":
    case "unknown":
      return false;
    case "object":
      return renderTypeShape(property, types);
    case "list":
      return renderTypeShape(property.itemShape, types);
    case "set":
      return renderTypeShape(property.itemShape, types);
    case "map":
      return renderTypeShape(property.valueShape, types);
    case "enum":
      return <div>enum</div>;
    case "discriminatedUnion":
      return "discriminated union";
    case "undiscriminatedUnion":
      return "undiscriminated union";
    default:
      console.error(new UnreachableCaseError(property));
      return false;
  }
}

function renderTypeShape(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>
): React.ReactNode {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  if (shape !== unwrapped.shape) {
    return renderObjectPropertyContent(unwrapped.shape, types);
  }

  switch (shape.type) {
    case "object":
      return <div>object</div>;
    case "enum":
      return <div>enum</div>;
    case "undiscriminatedUnion":
      return <div>undiscriminated union</div>;
    case "discriminatedUnion":
      return <div>discriminated union</div>;
    default:
      console.error(new UnreachableCaseError(shape));
      return false;
  }
}

function HttpRequestBody({
  body,
  types,
}: {
  body: ApiDefinition.HttpRequestBodyShape;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  switch (body.type) {
    case "bytes":
      return false;
    case "formData":
      return (
        <>
          {body.fields.map((field) => (
            <div key={field.key}>{field.key}</div>
          ))}
        </>
      );
    default: {
      const unwrapped = ApiDefinition.unwrapReference(body, types);
      if (unwrapped.shape.type !== "object") {
        return false;
      }

      const properties = ApiDefinition.unwrapObjectType(
        unwrapped.shape,
        types,
        unwrapped.visitedTypeIds // prevent circular references
      ).properties;

      const required = properties.filter(
        (property) =>
          !ApiDefinition.unwrapReference(property.valueShape, types).isOptional
      );

      const optional = properties.filter(
        (property) =>
          ApiDefinition.unwrapReference(property.valueShape, types).isOptional
      );

      if (required.length && optional.length) {
        return (
          <>
            {required.map((property) => (
              <ObjectProperty
                key={property.key}
                property={property}
                types={types}
              />
            ))}
            <Tree.CollapsedContent>
              {optional.map((property) => (
                <ObjectProperty
                  key={property.key}
                  property={property}
                  types={types}
                />
              ))}
            </Tree.CollapsedContent>
          </>
        );
      }

      return (
        <>
          {properties.map((property) => (
            <ObjectProperty
              key={property.key}
              property={property}
              types={types}
            />
          ))}
        </>
      );
    }
  }
}

function TypeShorthand({
  shape,
  types,
}: {
  shape: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  const lang = useTypeShorthandLang();
  switch (lang) {
    case "ts":
      return <TypeShorthandTypescript shape={shape} types={types} />;
    case "py":
      return <TypeShorthandPython shape={shape} types={types} />;
    default:
      return <TypeShorthandDefault shape={shape} types={types} />;
  }
}

export function TypeShorthandTypescript({
  shape,
  types,
}: {
  shape: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  return <div>unknown</div>;
}

export function TypeShorthandPython({
  shape,
  types,
}: {
  shape: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  return <div>unknown</div>;
}

export function TypeShorthandDefault({
  shape,
  types,
}: {
  shape: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  return renderTypeShorthand(shape, {}, types);
}
