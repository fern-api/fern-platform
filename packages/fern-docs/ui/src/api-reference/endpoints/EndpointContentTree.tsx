import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { MarkdownText } from "@fern-api/fdr-sdk/docs";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import {
  AvailabilityBadge,
  Badge,
  Button,
  cn,
  CopyToClipboardButton,
  Disclosure,
  StatusCodeBadge,
  TouchScreenOnly,
} from "@fern-docs/components";
import { Parameter, Tree } from "@fern-docs/components/tree";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { sortBy } from "es-toolkit/array";
import { capitalize } from "es-toolkit/string";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, LinkIcon } from "lucide-react";
import {
  ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  memo,
  PropsWithChildren,
  RefObject,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { UnreachableCaseError } from "ts-essentials";
import { useMemoOne } from "use-memo-one";
import {
  IS_READY_ATOM,
  LOCATION_ATOM,
  useTypeShorthandLang,
} from "../../atoms";
import { Chip } from "../../components/Chip";
import { Markdown } from "../../mdx/Markdown";
import { renderTypeShorthand } from "../../type-shorthand";
import {
  JsonPropertyPath,
  JsonPropertyPathPart,
} from "../examples/JsonPropertyPath";
import { EndpointSection } from "./EndpointSection";

interface EndpointContentTreeProps {
  context: ApiDefinition.EndpointContext;
  showErrors: boolean;
}

const AnchorIdContext = createContext<string | undefined>(undefined);
const SlugContext = createContext<string>("");

function AnchorIdProvider({
  children,
  id,
}: PropsWithChildren & { id: string }) {
  const parentId = useContext(AnchorIdContext);
  return (
    <AnchorIdContext.Provider value={parentId ? `${parentId}.${id}` : id}>
      {children}
    </AnchorIdContext.Provider>
  );
}

function useAnchorId() {
  return useContext(AnchorIdContext);
}

const JsonPathPartContext = createContext<RefObject<JsonPropertyPath>>({
  current: [],
});

function JsonPathPartProvider({
  children,
  value,
}: PropsWithChildren & {
  value: JsonPropertyPathPart | ((parts: JsonPropertyPath) => JsonPropertyPath);
}) {
  const jsonPathParts = useContext(JsonPathPartContext).current ?? [];
  const ref = useRef(
    typeof value === "function"
      ? value(jsonPathParts)
      : [...jsonPathParts, value]
  );
  useIsomorphicLayoutEffect(() => {
    ref.current =
      typeof value === "function"
        ? value(jsonPathParts)
        : [...jsonPathParts, value];
  }, [jsonPathParts, value]);
  return (
    <JsonPathPartContext.Provider value={ref}>
      {children}
    </JsonPathPartContext.Provider>
  );
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
    <SlugContext.Provider value={node.slug}>
      <TooltipProvider>
        <div className="flex max-w-full flex-1 flex-col gap-12">
          <Markdown
            className="text-base leading-6"
            mdx={endpoint.description}
          />
          <AnchorIdProvider id="request">
            {requestHeaders.length > 0 && (
              <AnchorIdProvider id="headers">
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
              </AnchorIdProvider>
            )}

            {endpoint.pathParameters && endpoint.pathParameters.length > 0 && (
              <AnchorIdProvider id="path">
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
                  <Tree.Root>
                    {sortBy(endpoint.pathParameters, [
                      (parameter) => parameter.availability === "Deprecated",
                    ]).map((parameter) => (
                      <ObjectProperty
                        key={parameter.key}
                        property={parameter}
                        types={types}
                      />
                    ))}
                  </Tree.Root>
                </EndpointSection>
              </AnchorIdProvider>
            )}

            {endpoint.queryParameters &&
              endpoint.queryParameters.length > 0 && (
                <AnchorIdProvider id="query">
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
                    <Tree.Root>
                      {sortBy(endpoint.queryParameters, [
                        (parameter) => parameter.availability === "Deprecated",
                      ]).map((parameter) => (
                        <ObjectProperty
                          key={parameter.key}
                          property={parameter}
                          types={types}
                        />
                      ))}
                    </Tree.Root>
                  </EndpointSection>
                </AnchorIdProvider>
              )}

            {request && (
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
                <Tree.Root>
                  <AnchorIdProvider id="body">
                    <HttpRequestBody body={request.body} types={types} />
                  </AnchorIdProvider>
                </Tree.Root>
              </EndpointSection>
            )}
          </AnchorIdProvider>

          <AnchorIdProvider id="response">
            {response && (
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
                <Tree.Root>
                  <AnchorIdProvider id="body">
                    <HttpResponseBody
                      key={response.statusCode}
                      body={response.body}
                      types={types}
                    />
                  </AnchorIdProvider>
                </Tree.Root>
              </EndpointSection>
            )}
          </AnchorIdProvider>
        </div>
      </TooltipProvider>
    </SlugContext.Provider>
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

const ObjectProperty = memo(
  ({
    property,
    types,
    visitedTypeIds: parentVisitedTypeIds = new Set(),
  }: {
    property: ApiDefinition.ObjectProperty;
    types: Record<string, ApiDefinition.TypeDefinition>;
    visitedTypeIds?: Set<ApiDefinition.TypeId>;
  }) => {
    const indent = Tree.useIndent();
    const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
    const visitedTypeIds = new Set([
      ...parentVisitedTypeIds,
      ...unwrapped.visitedTypeIds,
    ]);
    const open = Tree.useIsOpen();
    const shouldLazyLoad =
      [...unwrapped.visitedTypeIds].filter((id) => visitedTypeIds.has(id))
        .length > 0;
    // console.log(visitedTypeIds, unwrapped.visitedTypeIds);
    if (shouldLazyLoad && !open) {
      return null;
    }

    const availability = property.availability ?? unwrapped.availability;

    return (
      <AnchorIdProvider id={property.key}>
        <JsonPathPartProvider
          value={{ type: "objectProperty", propertyName: property.key }}
        >
          {hasChildren(property.valueShape, types, visitedTypeIds) ? (
            <Tree.Item asChild className={cn(indent === 0 && "-ml-2")}>
              <Tree.Details
                defaultOpen={isDefaultOpen(
                  property.valueShape,
                  types,
                  visitedTypeIds
                )}
                className={cn("mb-4", indent)}
              >
                <Tree.DetailsSummary className="relative">
                  <Tree.DetailsIndicator className="absolute -left-2 top-1" />
                  <Tree.DetailsTrigger asChild>
                    <ParameterInfo
                      parameterName={property.key}
                      property={property}
                      types={types}
                      className="my-2"
                    />
                  </Tree.DetailsTrigger>
                  <Tree.SummaryIndentedContent>
                    <div className="space-y-3">
                      {availability && (
                        <AvailabilityBadge
                          availability={availability}
                          size="sm"
                        />
                      )}
                      <Markdown
                        size="sm"
                        className={cn("text-text-muted mb-3 leading-normal")}
                        mdx={property.description ?? unwrapped.descriptions[0]}
                      />
                    </div>
                  </Tree.SummaryIndentedContent>
                  <Tree.ExpandChildrenButton>
                    {showChildAttributesMessage(property.valueShape, types)}
                  </Tree.ExpandChildrenButton>
                </Tree.DetailsSummary>
                {renderDereferencedShape(
                  unwrapped.shape,
                  types,
                  unwrapped.visitedTypeIds
                )}
              </Tree.Details>
            </Tree.Item>
          ) : (
            <Tree.Item
              className={cn("mb-4 space-y-2", indent === 0 && "-ml-2")}
            >
              <ParameterInfo
                parameterName={property.key}
                property={property}
                types={types}
                className="my-2"
              />

              <div className="space-y-2 pl-2">
                {availability && (
                  <AvailabilityBadge availability={availability} size="sm" />
                )}

                <Markdown
                  size="sm"
                  className={cn("text-text-muted leading-normal")}
                  mdx={property.description ?? unwrapped.descriptions[0]}
                />
              </div>
            </Tree.Item>
          )}
        </JsonPathPartProvider>
      </AnchorIdProvider>
    );
  }
);

ObjectProperty.displayName = "ObjectProperty";

function isDefaultOpen(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>,
  parentVisitedTypeIds = new Set<ApiDefinition.TypeId>()
) {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  const visitedTypeIds = new Set([
    ...parentVisitedTypeIds,
    ...unwrapped.visitedTypeIds,
  ]);

  switch (unwrapped.shape.type) {
    case "enum":
      return unwrapped.shape.values.length === 1;
    case "list":
    case "set":
      return isDefaultOpen(unwrapped.shape.itemShape, types, visitedTypeIds);
    case "map":
      return isDefaultOpen(unwrapped.shape.valueShape, types, visitedTypeIds);
    case "discriminatedUnion":
    case "undiscriminatedUnion":
      return unwrapped.shape.variants.length === 1;
    case "object":
      return (
        ApiDefinition.unwrapObjectType(unwrapped.shape, types).properties
          .length === 1
      );
    default:
      return false;
  }
}

type FocusableTarget = HTMLElement | { focus(): void };

function isSelectableInput(
  element: any
): element is FocusableTarget & { select: () => void } {
  return element instanceof HTMLInputElement && "select" in element;
}

function focus(element?: FocusableTarget | null, { select = false } = {}) {
  // only focus if that element is focusable
  if (element?.focus) {
    const previouslyFocusedElement = document.activeElement;
    // NOTE: we prevent scrolling on focus, to minimize jarring transitions for users
    element.focus({ preventScroll: true });
    // only select if its not the same element, it supports selection and we need to select
    if (
      element !== previouslyFocusedElement &&
      isSelectableInput(element) &&
      select
    )
      element.select();
  }
}

const ParameterInfo = memo(
  forwardRef<
    HTMLDivElement,
    Omit<ComponentPropsWithoutRef<typeof Parameter.Root>, "property"> & {
      parameterName: string;
      property: ApiDefinition.ObjectProperty;
      types: Record<string, ApiDefinition.TypeDefinition>;
      unwrapped?: ApiDefinition.UnwrappedReference;
    }
  >(
    (
      { parameterName, property, types, unwrapped: unwrappedProp, ...props },
      ref
    ) => {
      const jsonpath = useContext(JsonPathPartContext).current ?? [];
      const slug = useContext(SlugContext);
      const anchorId = useAnchorId() ?? property.key;
      const unwrapped =
        unwrappedProp ??
        ApiDefinition.unwrapReference(property.valueShape, types);
      const isActive = useAtomValue(
        useMemoOne(
          () =>
            atom(
              (get) =>
                get(IS_READY_ATOM) && get(LOCATION_ATOM).hash === `#${anchorId}`
            ),
          [anchorId]
        )
      );
      const setLocation = useSetAtom(LOCATION_ATOM);
      const nameRef = useRef<HTMLButtonElement>(null);

      useEffect(() => {
        if (isActive) {
          setTimeout(() => {
            let parent = nameRef.current?.parentElement;
            while (parent) {
              if (parent instanceof HTMLDetailsElement) {
                parent.open = true;
              }
              parent = parent.parentElement;
            }

            focus(nameRef.current, { select: true });
            setTimeout(() => {
              // don't scroll if the element is already visible
              if (nameRef.current) {
                const rect = nameRef.current.getBoundingClientRect();
                const isVisible =
                  rect.top >= 0 &&
                  rect.left >= 0 &&
                  rect.bottom <=
                    (window.innerHeight ||
                      document.documentElement.clientHeight) &&
                  rect.right <=
                    (window.innerWidth || document.documentElement.clientWidth);

                if (!isVisible) {
                  nameRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }
            }, 150);
          }, 150);
        }
      }, [isActive]);

      return (
        <Parameter.Root
          ref={ref}
          {...props}
          onPointerEnter={() => {
            window.dispatchEvent(
              new CustomEvent("hover-json-property", {
                detail: {
                  slug,
                  jsonpath,
                  isHovering: true,
                  type: anchorId.startsWith("request") ? "request" : "response",
                },
              })
            );
          }}
          onPointerLeave={() => {
            window.dispatchEvent(
              new CustomEvent("hover-json-property", {
                detail: {
                  slug,
                  jsonpath,
                  isHovering: false,
                  type: anchorId.startsWith("request") ? "request" : "response",
                },
              })
            );
          }}
          onFocus={() => {
            window.dispatchEvent(
              new CustomEvent("hover-json-property", {
                detail: {
                  slug,
                  jsonpath,
                  isHovering: true,
                  type: anchorId.startsWith("request") ? "request" : "response",
                },
              })
            );
          }}
          onBlur={() => {
            window.dispatchEvent(
              new CustomEvent("hover-json-property", {
                detail: {
                  slug,
                  jsonpath,
                  isHovering: false,
                  type: anchorId.startsWith("request") ? "request" : "response",
                },
              })
            );
          }}
        >
          <Parameter.Name
            ref={nameRef}
            parameterName={property.key}
            className={cn("-mr-2 shrink-0 scroll-m-4", {
              "line-through": property.availability === "Deprecated",
            })}
            color={property.availability === "Deprecated" ? "gray" : "accent"}
            variant={isActive ? "subtle" : "ghost"}
            onClickCopyAnchorLink={() => {
              const url = String(
                new URL(`/${slug}#${anchorId}`, window.location.href)
              );
              void navigator.clipboard.writeText(url);
              setLocation((location) => ({
                ...location,
                pathname: `/${slug}`,
                hash: `#${anchorId}`,
              }));
            }}
          />
          <span className="-ml-3 text-xs text-[var(--grayscale-a9)]">
            <TypeShorthand
              shape={unwrapped.shape}
              isOptional={unwrapped.isOptional}
              types={types}
            />
            {unwrapped.default != null &&
              unwrapped.shape.type !== "literal" &&
              typeof unwrapped.default !== "object" && (
                <span className="ml-2 font-mono">
                  {`= ${JSON.stringify(unwrapped.default)}`}
                </span>
              )}
          </span>
          <Parameter.Spacer />
          {anchorId.startsWith("request") && !unwrapped.isOptional && (
            <Parameter.Status status="required" />
          )}
          <TouchScreenOnly asChild>
            <CopyToClipboardButton
              asChild
              content={() => {
                return String(
                  new URL(`/${slug}#${anchorId}`, window.location.href)
                );
              }}
            >
              <Button
                size="iconXs"
                variant="ghost"
                color="gray"
                className="-m-1 shrink-0 self-center"
              >
                <LinkIcon />
              </Button>
            </CopyToClipboardButton>
          </TouchScreenOnly>
        </Parameter.Root>
      );
    }
  )
);

ParameterInfo.displayName = "ParameterInfo";

function hasChildren(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>,
  parentVisitedTypeIds = new Set<ApiDefinition.TypeId>()
) {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  const visitedTypeIds = new Set([
    ...parentVisitedTypeIds,
    ...unwrapped.visitedTypeIds,
  ]);
  switch (unwrapped.shape.type) {
    case "object":
      return (
        ApiDefinition.unwrapObjectType(unwrapped.shape, types, visitedTypeIds)
          .properties.length > 0 || !!unwrapped.shape.extraProperties
      );
    case "discriminatedUnion":
    case "undiscriminatedUnion":
      return unwrapped.shape.variants.length > 0;
    case "list":
    case "set":
      return hasChildren(unwrapped.shape.itemShape, types, visitedTypeIds);
    case "map":
      return hasChildren(unwrapped.shape.valueShape, types, visitedTypeIds);
    case "enum":
      return unwrapped.shape.values.length > 0;
    default:
      return false;
  }
}

function showChildAttributesMessage(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>,
  parentVisitedTypeIds = new Set<ApiDefinition.TypeId>()
) {
  const unwrapped = ApiDefinition.unwrapReference(shape, types);
  const visitedTypeIds = new Set([
    ...parentVisitedTypeIds,
    ...unwrapped.visitedTypeIds,
  ]);
  switch (unwrapped.shape.type) {
    case "object": {
      const properties = ApiDefinition.unwrapObjectType(
        unwrapped.shape,
        types,
        visitedTypeIds
      ).properties;
      return `Show ${properties.length} child attribute${
        properties.length > 1 ? "s" : ""
      }`;
    }
    case "discriminatedUnion":
    case "undiscriminatedUnion":
      return `Show ${unwrapped.shape.variants.length} variant${
        unwrapped.shape.variants.length > 1 ? "s" : ""
      }`;
    case "list":
    case "set":
      return showChildAttributesMessage(
        unwrapped.shape.itemShape,
        types,
        visitedTypeIds
      );
    case "map":
      return showChildAttributesMessage(
        unwrapped.shape.valueShape,
        types,
        visitedTypeIds
      );
    case "enum":
      return `Show ${unwrapped.shape.values.length} enum value${
        unwrapped.shape.values.length > 1 ? "s" : ""
      }`;
    default:
      return undefined;
  }
}

function renderDereferencedShape(
  property: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference,
  types: Record<string, ApiDefinition.TypeDefinition>,
  visitedTypeIds?: Set<ApiDefinition.TypeId>
) {
  switch (property.type) {
    case "literal":
    case "primitive":
    case "unknown":
      return false;
    case "list":
    case "set": {
      const content = renderTypeShape(
        property.itemShape,
        types,
        visitedTypeIds
      );
      if (!content) {
        return false;
      }
      return (
        <JsonPathPartProvider value={{ type: "listItem" }}>
          {content}
        </JsonPathPartProvider>
      );
    }
    case "map": {
      const content = renderTypeShape(
        property.valueShape,
        types,
        visitedTypeIds
      );
      if (!content) {
        return false;
      }
      return (
        <JsonPathPartProvider value={{ type: "objectProperty" }}>
          {content}
        </JsonPathPartProvider>
      );
    }
    case "enum":
      return (
        <Tree.Content>{<EnumList values={property.values} />}</Tree.Content>
      );
    case "object": {
      return (
        <ObjectTypeShape
          shape={property}
          types={types}
          visitedTypeIds={visitedTypeIds}
        />
      );
    }
    case "undiscriminatedUnion":
      return (
        <Tree.Content>
          <Tree.Card className="my-2">
            <Tree.Variants>
              {property.variants.map((variant, idx) => {
                const description =
                  variant.description ??
                  ApiDefinition.unwrapReference(variant.shape, types)
                    .descriptions[0];
                return (
                  <AnchorIdProvider
                    id={variant.displayName ?? String(idx)}
                    key={idx}
                  >
                    {(variant.displayName ||
                      variant.availability ||
                      description) && (
                      <VariantDescription
                        displayName={variant.displayName}
                        availability={variant.availability}
                        description={description}
                      />
                    )}
                    {renderTypeShape(variant.shape, types, visitedTypeIds) || (
                      <span className="text-text-muted text-xs">
                        {renderTypeShorthand(variant.shape, {}, types)}
                      </span>
                    )}
                  </AnchorIdProvider>
                );
              })}
            </Tree.Variants>
          </Tree.Card>
        </Tree.Content>
      );
    case "discriminatedUnion":
      return (
        <Tree.Content>
          <Tree.Card className="my-2">
            <Tree.Variants>
              {property.variants.map((variant) => {
                const description =
                  variant.description ??
                  ApiDefinition.unwrapObjectType(variant, types)
                    .descriptions[0];
                return (
                  <AnchorIdProvider
                    id={variant.discriminantValue}
                    key={variant.discriminantValue}
                  >
                    <JsonPathPartProvider
                      value={{
                        type: "objectFilter",
                        propertyName: property.discriminant,
                        requiredStringValue: variant.discriminantValue,
                      }}
                    >
                      {(variant.displayName ||
                        variant.availability ||
                        description) && (
                        <VariantDescription
                          displayName={variant.displayName}
                          availability={variant.availability}
                          description={description}
                        />
                      )}
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
                          description: undefined,
                          availability: undefined,
                        }}
                        types={types}
                        visitedTypeIds={visitedTypeIds}
                      />
                      <ObjectTypeShape
                        shape={variant}
                        types={types}
                        visitedTypeIds={visitedTypeIds}
                      />
                    </JsonPathPartProvider>
                  </AnchorIdProvider>
                );
              })}
            </Tree.Variants>
          </Tree.Card>
        </Tree.Content>
      );
    default:
      console.error(new UnreachableCaseError(property));
      return false;
  }
}

function VariantDescription({
  displayName,
  availability,
  description,
}: {
  displayName?: string;
  availability?: ApiDefinition.Availability;
  description?: MarkdownText;
}) {
  return (
    <div className={"border-b border-[var(--grayscale-5)] pb-2 leading-normal"}>
      {(displayName || availability) && (
        <div className="flex items-center">
          {displayName && <h6 className="mb-0">{displayName}</h6>}
          {availability && (
            <AvailabilityBadge
              availability={availability}
              size="sm"
              className="ml-auto"
            />
          )}
        </div>
      )}
      <Markdown size="sm" mdx={description} />
    </div>
  );
}

const EnumList = memo(({ values }: { values: ApiDefinition.EnumValue[] }) => {
  if (values.length > 10) {
    return (
      <Disclosure.Root animationOptions={{ duration: 0 }}>
        <Disclosure.Details className="mt-1.5">
          <Disclosure.Summary>
            <Disclosure.If
              open={false}
              className={cn(
                "flex flex-wrap gap-3",
                !values.slice(0, 10).every((v) => !v.description) && "flex-col"
              )}
            >
              {values.slice(0, 10).map((value) =>
                value.description ? (
                  <div key={value.value}>
                    <Chip className="font-mono" variant="outlined-subtle">
                      {value.value}
                    </Chip>
                    <Markdown
                      size="sm"
                      mdx={value.description}
                      className="text-text-muted mt-3"
                    />
                  </div>
                ) : (
                  <Chip
                    className="font-mono"
                    variant="outlined-subtle"
                    key={value.value}
                  >
                    {value.value}
                  </Chip>
                )
              )}
              <Disclosure.Trigger>
                <Badge variant="subtle">
                  <ChevronDown />
                  Show all {values.length} values
                </Badge>
              </Disclosure.Trigger>
            </Disclosure.If>
          </Disclosure.Summary>
          <Disclosure.Content
            innerClassName={cn(
              "flex flex-wrap gap-3",
              !values.every((v) => !v.description) && "flex-col"
            )}
          >
            {values.map((value) =>
              value.description ? (
                <div key={value.value}>
                  <Chip className="font-mono" variant="outlined-subtle">
                    {value.value}
                  </Chip>
                  <Markdown
                    size="sm"
                    mdx={value.description}
                    className="text-text-muted mt-3"
                  />
                </div>
              ) : (
                <Chip
                  className="font-mono"
                  variant="outlined-subtle"
                  key={value.value}
                >
                  {value.value}
                </Chip>
              )
            )}
          </Disclosure.Content>
        </Disclosure.Details>
      </Disclosure.Root>
    );
  }

  return (
    <div
      className={cn(
        "mt-1.5 flex flex-wrap gap-3",
        !values.every((v) => !v.description) && "flex-col"
      )}
    >
      {values.map((value) =>
        value.description ? (
          <div key={value.value}>
            <Chip className="font-mono" variant="outlined-subtle">
              {value.value}
            </Chip>
            <Markdown
              size="sm"
              mdx={value.description}
              className="text-text-muted mt-3"
            />
          </div>
        ) : (
          <Chip
            className="font-mono"
            variant="outlined-subtle"
            key={value.value}
          >
            {value.value}
          </Chip>
        )
      )}
    </div>
  );
});

EnumList.displayName = "EnumList";

function renderTypeShape(
  shape: ApiDefinition.TypeShape,
  types: Record<string, ApiDefinition.TypeDefinition>,
  visitedTypeIds = new Set<ApiDefinition.TypeId>()
): React.ReactNode {
  switch (shape.type) {
    case "alias": {
      const unwrapped = ApiDefinition.unwrapReference(shape, types);
      return renderDereferencedShape(
        unwrapped.shape,
        types,
        new Set([...visitedTypeIds, ...unwrapped.visitedTypeIds])
      );
    }
    default:
      return renderDereferencedShape(shape, types, visitedTypeIds);
  }
}

function HttpRequestBody({
  body,
  types,
  visitedTypeIds = new Set(),
}: {
  body: ApiDefinition.HttpRequestBodyShape;
  types: Record<string, ApiDefinition.TypeDefinition>;
  visitedTypeIds?: Set<ApiDefinition.TypeId>;
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
          visitedTypeIds={
            new Set([...visitedTypeIds, ...unwrapped.visitedTypeIds])
          }
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

function ObjectTypeShape({
  shape,
  types,
  visitedTypeIds: parentVisitedTypeIds = new Set(),
}: {
  shape:
    | ApiDefinition.TypeShape.Object_
    | ApiDefinition.DiscriminatedUnionVariant;
  types: Record<string, ApiDefinition.TypeDefinition>;
  visitedTypeIds?: Set<ApiDefinition.TypeId>;
}) {
  const {
    properties,
    extraProperties,
    visitedTypeIds: objectVisitedTypeIds,
  } = ApiDefinition.unwrapObjectType(shape, types);

  const visitedTypeIds = new Set([
    ...parentVisitedTypeIds,
    ...objectVisitedTypeIds,
  ]);

  const required = properties.filter(
    (property) =>
      !ApiDefinition.unwrapReference(property.valueShape, types).isOptional
  );

  const optional = properties.filter(
    (property) =>
      ApiDefinition.unwrapReference(property.valueShape, types).isOptional
  );

  if (required.length && optional.length > 1) {
    return (
      <>
        <Tree.Content notLast>
          {required.map((property) => (
            <ObjectProperty
              key={property.key}
              property={property}
              types={types}
              visitedTypeIds={visitedTypeIds}
            />
          ))}
        </Tree.Content>
        <Tree.CollapsedContent
          defaultOpen={optional.length === 1}
          // className={cn(indent === 0 && "pl-2")}
        >
          {optional.map((property) => (
            <ObjectProperty
              key={property.key}
              property={property}
              types={types}
              visitedTypeIds={visitedTypeIds}
            />
          ))}
          {extraProperties && (
            <ObjectProperty
              property={{
                key: ApiDefinition.PropertyKey("..."),
                valueShape: {
                  type: "alias",
                  value: {
                    type: "optional",
                    shape: {
                      type: "alias",
                      value: extraProperties,
                    },
                    default: undefined,
                  },
                },
                description: undefined,
                availability: undefined,
              }}
              types={types}
              visitedTypeIds={visitedTypeIds}
            />
          )}
        </Tree.CollapsedContent>
      </>
    );
  }

  return (
    <Tree.Content>
      {properties.map((property) => (
        <ObjectProperty
          key={property.key}
          property={property}
          types={types}
          visitedTypeIds={visitedTypeIds}
        />
      ))}
    </Tree.Content>
  );
}

function TypeShorthand({
  shape,
  types,
  isOptional,
}: {
  shape: ApiDefinition.TypeShapeOrReference;
  isOptional: boolean;
  types: Record<string, ApiDefinition.TypeDefinition>;
}) {
  const lang = useTypeShorthandLang();
  switch (lang) {
    case "ts":
      return (
        <TypeShorthandTypescript
          shape={shape}
          types={types}
          isOptional={isOptional}
        />
      );
    case "py":
      return (
        <TypeShorthandPython
          shape={shape}
          types={types}
          isOptional={isOptional}
        />
      );
    default:
      return (
        <TypeShorthandDefault
          shape={shape}
          types={types}
          isOptional={isOptional}
        />
      );
  }
}

export function TypeShorthandTypescript({
  shape,
  types,
  isOptional,
  visitedTypeIds = new Set(),
}: {
  shape: ApiDefinition.TypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
  isOptional?: boolean;
  visitedTypeIds?: Set<ApiDefinition.TypeId>;
}) {
  function toString(
    shape: ApiDefinition.TypeShapeOrReference,
    parentVisitedTypeIds: Set<ApiDefinition.TypeId>
  ): string {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);

    const visitedTypeIds = new Set([
      ...parentVisitedTypeIds,
      ...unwrapped.visitedTypeIds,
    ]);

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
          : String(unwrapped.shape.value.value);
      case "list": {
        const str = toString(unwrapped.shape.itemShape, visitedTypeIds);
        return str.includes(" ") ? `Array<${str}>` : `${str}[]`;
      }
      case "set":
        return `Set<${toString(unwrapped.shape.itemShape, visitedTypeIds)}>`;
      case "map":
        return `Record<${toString(unwrapped.shape.keyShape, visitedTypeIds)}, ${toString(unwrapped.shape.valueShape, visitedTypeIds)}>`;
      case "enum":
        if (unwrapped.shape.values.length > 3) {
          return "enum";
        }
        return unwrapped.shape.values
          .map((value) => `"${value.value}"`)
          .join(" | ");
      case "undiscriminatedUnion":
        return unwrapped.shape.variants
          .map((variant) => toString(variant.shape, visitedTypeIds))
          .join(" | ");
      case "discriminatedUnion":
        return "object";
      case "unknown":
      default:
        return "any";
    }
  }

  return (
    <span className="font-mono">
      {`${isOptional ? "?: " : ": "}${toString(shape, visitedTypeIds)}`}
    </span>
  );
}

export function TypeShorthandPython({
  shape,
  types,
  isOptional,
  visitedTypeIds = new Set(),
}: {
  shape: ApiDefinition.TypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
  isOptional?: boolean;
  visitedTypeIds?: Set<ApiDefinition.TypeId>;
}) {
  function toString(
    shape: ApiDefinition.TypeShapeOrReference,
    parentVisitedTypeIds: Set<ApiDefinition.TypeId>
  ): string {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    const visitedTypeIds = new Set([
      ...parentVisitedTypeIds,
      ...unwrapped.visitedTypeIds,
    ]);
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
          ? `Literal["${unwrapped.shape.value.value}"]`
          : capitalize(String(unwrapped.shape.value.value));
      case "list":
        return `List[${toString(unwrapped.shape.itemShape, visitedTypeIds)}]`;
      case "set":
        return `Set[${toString(unwrapped.shape.itemShape, visitedTypeIds)}]`;
      case "map":
        return `Dict[${toString(unwrapped.shape.keyShape, visitedTypeIds)}, ${toString(unwrapped.shape.valueShape, visitedTypeIds)}]`;
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
          .map((variant) => toString(variant.shape, visitedTypeIds))
          .join(", ")}]`;
      case "discriminatedUnion":
        return "Union";
      case "unknown":
      default:
        return "Any";
    }
  }

  const title = isOptional
    ? `Optional[${toString(shape, visitedTypeIds)}]`
    : toString(shape, visitedTypeIds);

  return <span className="font-mono" title={title}>{`: ${title}`}</span>;
}

export function TypeShorthandDefault({
  shape,
  types,
  isOptional,
}: {
  shape: ApiDefinition.TypeShapeOrReference;
  types: Record<string, ApiDefinition.TypeDefinition>;
  isOptional?: boolean;
}) {
  const title = renderTypeShorthand(shape, { isOptional }, types);
  return (
    <span className="ml-3" title={title}>
      {title}
    </span>
  );
}
