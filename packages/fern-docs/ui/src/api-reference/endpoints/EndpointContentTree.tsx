import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { AvailabilityBadge, cn } from "@fern-docs/components";
import { Parameter, Tree } from "@fern-docs/components/tree";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { UnreachableCaseError } from "ts-essentials";
import { useTypeShorthandLang } from "../../atoms";
import { Chip } from "../../components/Chip";
import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthand } from "../../type-shorthand";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { EnumDefinitionDetails } from "../types/type-definition/EnumDefinitionDetails";
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

        {endpoint.responses?.[0] && (
          <EndpointSection
            title="Response"
            anchorIdParts={["response"]}
            slug={node.slug}
          >
            <Tree.Root>
              <HttpResponseBody
                key={endpoint.responses[0].statusCode}
                body={endpoint.responses[0].body}
                types={types}
              />
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
  const indent = Tree.useIndent();
  return (
    <Tree.Item defaultOpen={isDefaultOpen(property.valueShape, types)}>
      <Tree.Summary
        collapseTriggerMessage={showChildAttributesMessage(
          property.valueShape,
          types
        )}
      >
        <Tree.Trigger className="relative flex items-center text-left">
          <Tree.Indicator
            className={cn("absolute", {
              "-left-4": indent === 0,
              "-left-2": indent > 0,
            })}
          />
          <Parameter.Root className="flex-1">
            <Parameter.Name
              parameterName={property.key}
              className={cn({
                "-mx-2": indent === 0,
                "-mr-2": indent > 0,
                "line-through": property.availability === "Deprecated",
              })}
              color={property.availability === "Deprecated" ? "gray" : "accent"}
            />
            <span className="text-xs text-[var(--grayscale-a9)]">
              <TypeShorthand shape={unwrapped.shape} types={types} />
              {unwrapped.default != null &&
                unwrapped.shape.type !== "literal" &&
                typeof unwrapped.default !== "object" && (
                  <span className="ml-2 font-mono">
                    {`= ${JSON.stringify(unwrapped.default)}`}
                  </span>
                )}
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
          className={cn("text-text-muted mt-2 leading-normal", {
            "pl-2": indent > 0,
          })}
          mdx={property.description ?? unwrapped.descriptions[0]}
        />
      </Tree.Summary>
      {renderDereferencedShape(unwrapped.shape, types)}
    </Tree.Item>
  );
}

function isDefaultOpen(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>
) {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  switch (unwrapped.shape.type) {
    case "enum":
      return unwrapped.shape.values.length < 7;
    case "list":
    case "set":
      return isDefaultOpen(unwrapped.shape.itemShape, types);
    case "map":
      return isDefaultOpen(unwrapped.shape.valueShape, types);
    case "discriminatedUnion":
    case "undiscriminatedUnion":
      return unwrapped.shape.variants.length === 1;
    default:
      return false;
  }
}

function showChildAttributesMessage(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>
) {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  switch (unwrapped.shape.type) {
    case "object":
      return "Show child attributes";
    case "discriminatedUnion":
    case "undiscriminatedUnion":
      return `Show ${unwrapped.shape.variants.length} variants`;
    case "list":
    case "set":
      return "Show list item attributes";
    case "map":
      return "Show map value attributes";
    case "enum":
      return `Show ${unwrapped.shape.values.length} enum values`;
    default:
      return undefined;
  }
}

function renderDereferencedShape(
  property: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference,
  types: Record<string, ApiDefinition.TypeDefinition>,
  parentVisitedTypeIds?: Set<ApiDefinition.TypeId>
) {
  switch (property.type) {
    case "literal":
    case "primitive":
    case "unknown":
      return false;
    case "list":
      return renderTypeShape(property.itemShape, types, parentVisitedTypeIds);
    case "set":
      return renderTypeShape(property.itemShape, types, parentVisitedTypeIds);
    case "map":
      return renderTypeShape(property.valueShape, types, parentVisitedTypeIds);
    case "enum":
      return (
        <Tree.Content>
          <Tree.Card className="mb-2">
            <EnumDefinitionDetails className="p-2">
              {property.values.map((value) => (
                <Chip
                  key={value.value}
                  name={value.value}
                  description={value.description}
                />
              ))}
            </EnumDefinitionDetails>
          </Tree.Card>
        </Tree.Content>
      );
    case "object": {
      return (
        <ObjectTypeShape
          shape={property}
          types={types}
          parentVisitedTypeIds={parentVisitedTypeIds}
        />
      );
    }
    case "undiscriminatedUnion":
      return (
        <Tree.Content>
          <Tree.Card className="mb-2">
            <Tree.Variants>
              {property.variants.map((variant) => (
                <>
                  {(variant.displayName || variant.availability) && (
                    <div className="flex items-center gap-2">
                      {variant.displayName && <h5>{variant.displayName}</h5>}
                      {variant.availability && (
                        <AvailabilityBadge
                          availability={variant.availability}
                          size="sm"
                          className="ml-auto"
                        />
                      )}
                    </div>
                  )}
                  <Markdown
                    className="text-base leading-6"
                    mdx={variant.description}
                  />
                  {renderTypeShape(
                    variant.shape,
                    types,
                    parentVisitedTypeIds
                  ) || renderTypeShorthand(variant.shape, {}, types)}
                </>
              ))}
            </Tree.Variants>
          </Tree.Card>
        </Tree.Content>
      );
    case "discriminatedUnion":
      return (
        <Tree.Content>
          <Tree.Card className="mb-2">
            <Tree.Variants>
              {property.variants.map((variant) => (
                <>
                  <ObjectProperty
                    property={{
                      key: ApiDefinition.PropertyKey(property.discriminant),
                      valueShape: {
                        type: "alias",
                        value: {
                          type: "literal",
                          value: {
                            type: "stringLiteral",
                            value: variant.discriminantValue,
                          },
                        },
                      },
                      description:
                        variant.description ??
                        ApiDefinition.unwrapObjectType(
                          variant,
                          types,
                          parentVisitedTypeIds
                        ).descriptions[0],
                      availability: undefined,
                    }}
                    types={types}
                  />
                  <ObjectTypeShape
                    shape={variant}
                    types={types}
                    parentVisitedTypeIds={parentVisitedTypeIds}
                  />
                </>
              ))}
            </Tree.Variants>
          </Tree.Card>
        </Tree.Content>
      );
    default:
      console.error(new UnreachableCaseError(property));
      return false;
  }
}

function renderTypeShape(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>,
  parentVisitedTypeIds?: Set<ApiDefinition.TypeId>
): React.ReactNode {
  switch (shape.type) {
    case "alias": {
      const unwrapped = ApiDefinition.unwrapReference(shape, types);
      return renderDereferencedShape(
        unwrapped.shape,
        types,
        new Set([...(parentVisitedTypeIds ?? []), ...unwrapped.visitedTypeIds])
      );
    }
    default:
      return renderDereferencedShape(shape, types, parentVisitedTypeIds);
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

      return (
        <ObjectTypeShape
          shape={unwrapped.shape}
          types={types}
          parentVisitedTypeIds={unwrapped.visitedTypeIds}
        />
      );
    }
  }
}

function HttpResponseBody({
  body,
  types,
}: {
  body: ApiDefinition.HttpResponseBodyShape;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  switch (body.type) {
    case "fileDownload":
    case "streamingText":
      return false;
    case "stream":
      return renderTypeShape(body.shape, types);
    case "object":
    case "alias":
      return renderTypeShape(body, types);
    default:
      console.error(new UnreachableCaseError(body));
      return false;
  }
}

function ObjectTypeShape({
  shape,
  types,
  parentVisitedTypeIds,
}: {
  shape:
    | ApiDefinition.TypeShape.Object_
    | ApiDefinition.DiscriminatedUnionVariant;
  types: Record<string, ApiDefinition.TypeDefinition>;
  parentVisitedTypeIds?: Set<ApiDefinition.TypeId>;
}) {
  const { properties, extraProperties } = ApiDefinition.unwrapObjectType(
    shape,
    types,
    parentVisitedTypeIds
  );

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
        <Tree.Content>
          {required.map((property) => (
            <ObjectProperty
              key={property.key}
              property={property}
              types={types}
            />
          ))}
        </Tree.Content>
        <Tree.CollapsedContent defaultOpen={optional.length === 1}>
          {optional.map((property) => (
            <ObjectProperty
              key={property.key}
              property={property}
              types={types}
            />
          ))}
          {extraProperties && (
            <ObjectProperty
              property={{
                key: ApiDefinition.PropertyKey("..."),
                valueShape: {
                  type: "alias",
                  value: extraProperties,
                },
                description: undefined,
                availability: undefined,
              }}
              types={types}
            />
          )}
        </Tree.CollapsedContent>
      </>
    );
  }

  return (
    <Tree.Content>
      {properties.map((property) => (
        <ObjectProperty key={property.key} property={property} types={types} />
      ))}
    </Tree.Content>
  );
}

function TypeShorthand({
  shape,
  types,
}: {
  shape: ApiDefinition.TypeShapeOrReference;
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
  shape: ApiDefinition.TypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  function toString(shape: ApiDefinition.TypeShapeOrReference): string {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    switch (unwrapped.shape.type) {
      case "primitive": {
        switch (unwrapped.shape.value.type) {
          case "string":
          case "uuid":
          case "base64":
            return "string";
          case "date":
          case "datetime":
            return "Date";
          case "bigInteger":
            return "bigint";
          case "integer":
          case "uint":
          case "uint64":
          case "long":
            return "number";
          case "double":
            return "float";
          case "boolean":
            return "boolean";
          default:
            return "unknown";
        }
      }
      case "object":
        return "object";
      case "literal":
        return unwrapped.shape.value.type === "stringLiteral"
          ? `"${unwrapped.shape.value.value}"`
          : unwrapped.shape.value.value
            ? "true"
            : "false";
      case "list": {
        const str = toString(unwrapped.shape.itemShape);
        return str.includes(" ") ? `Array<${str}>` : `${str}[]`;
      }
      case "set":
        return `Set<${toString(unwrapped.shape.itemShape)}>`;
      case "map":
        return `Record<${toString(unwrapped.shape.keyShape)}, ${toString(unwrapped.shape.valueShape)}>`;
      case "enum":
        if (unwrapped.shape.values.length > 3) {
          return "enum";
        }
        return unwrapped.shape.values
          .map((value) => `"${value.value}"`)
          .join(" | ");
      case "undiscriminatedUnion":
        return unwrapped.shape.variants
          .map((variant) => toString(variant.shape))
          .join(" | ");
      case "discriminatedUnion":
        return "object";
      case "unknown":
        return "unknown";
    }
  }

  return <span className="-ml-3 font-mono">: {toString(shape)}</span>;
}

export function TypeShorthandPython({
  shape,
  types,
}: {
  shape: ApiDefinition.TypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  function toString(shape: ApiDefinition.TypeShapeOrReference): string {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    switch (unwrapped.shape.type) {
      case "primitive": {
        switch (unwrapped.shape.value.type) {
          case "string":
            return "str";
          case "uuid":
            return "UUID";
          case "date":
            return "datetime.date";
          case "datetime":
            return "datetime.datetime";
          case "bigInteger":
          case "integer":
          case "uint":
          case "uint64":
          case "double":
          case "long":
            return "int";
          case "boolean":
            return "bool";
          case "base64":
            return "bytes";
          default:
            return "Any";
        }
      }
      case "object":
        return "dict";
      case "literal":
        return unwrapped.shape.value.type === "stringLiteral"
          ? `"${unwrapped.shape.value.value}"`
          : unwrapped.shape.value.value
            ? "True"
            : "False";
      case "list":
        return `List[${toString(unwrapped.shape.itemShape)}]`;
      case "set":
        return `Set[${toString(unwrapped.shape.itemShape)}]`;
      case "map":
        return `Dict[${toString(unwrapped.shape.keyShape)}, ${toString(unwrapped.shape.valueShape)}]`;
      case "enum":
        if (unwrapped.shape.values.length > 3) {
          return "Enum";
        }
        return unwrapped.shape.values
          .map((value) => `"${value.value}"`)
          .join(" | ");
      case "undiscriminatedUnion":
        if (unwrapped.shape.variants.length > 3) {
          return "Union";
        }
        return `Union[${unwrapped.shape.variants
          .map((variant) => toString(variant.shape))
          .join(", ")}]`;
      case "discriminatedUnion":
        return "Union";
      case "unknown":
      default:
        return "Any";
    }
  }

  return <span className="-ml-3 font-mono">: {toString(shape)}</span>;
}

export function TypeShorthandDefault({
  shape,
  types,
}: {
  shape: ApiDefinition.TypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  return renderTypeShorthand(shape, {}, types);
}
