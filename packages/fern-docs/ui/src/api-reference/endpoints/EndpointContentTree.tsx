import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import {
  AvailabilityBadge,
  Badge,
  Button,
  cn,
  FernButtonGroup,
  FernInput,
  StatusCodeBadge,
} from "@fern-docs/components";
import { Parameter, Tree } from "@fern-docs/components/tree";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { capitalize } from "es-toolkit/string";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { ChevronsDownUp, ChevronsUpDown, ListFilter } from "lucide-react";
import {
  ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  PropsWithChildren,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useIsomorphicLayoutEffect } from "swr/_internal";
import { noop, UnreachableCaseError } from "ts-essentials";
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

const HoverPropertyContext =
  createContext<
    (jsonPropertyPath: JsonPropertyPath, hovering: HoveringProps) => void
  >(noop);

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
  onHoverRequestProperty,
  onHoverResponseProperty,
}: EndpointContentTreeProps) {
  const requestHeaders = [
    ...(auth ? [toAuthHeader(auth)] : []),
    ...globalHeaders,
    ...(endpoint.requestHeaders ?? []),
  ];

  return (
    <SlugContext.Provider value={node.slug}>
      <TooltipProvider>
        <div className="flex max-w-full flex-1 flex-col gap-12">
          <Markdown
            className="text-base leading-6"
            mdx={endpoint.description}
          />
          <AnchorIdProvider id="request">
            <HoverPropertyContext.Provider value={onHoverRequestProperty}>
              {requestHeaders.length > 0 && (
                <Tree.Root>
                  <AnchorIdProvider id="headers">
                    <EndpointSection
                      title="Headers"
                      anchorIdParts={["request", "headers"]}
                      slug={node.slug}
                      headerRight={
                        <Tree.HasDisclosures>
                          <FernButtonGroup>
                            <Tree.CollapseAll asChild>
                              <Button size="iconXs" variant="ghost">
                                <ChevronsDownUp />
                              </Button>
                            </Tree.CollapseAll>
                            <Tree.ExpandAll asChild>
                              <Button size="iconXs" variant="ghost">
                                <ChevronsUpDown />
                              </Button>
                            </Tree.ExpandAll>
                          </FernButtonGroup>
                        </Tree.HasDisclosures>
                      }
                    >
                      {requestHeaders.map((header) => (
                        <ObjectProperty
                          key={header.key}
                          property={header}
                          types={types}
                        />
                      ))}
                    </EndpointSection>
                  </AnchorIdProvider>
                </Tree.Root>
              )}

              {endpoint.pathParameters &&
                endpoint.pathParameters.length > 0 && (
                  <Tree.Root>
                    <AnchorIdProvider id="path">
                      <EndpointSection
                        title="Path parameters"
                        anchorIdParts={["request", "path"]}
                        slug={node.slug}
                        headerRight={
                          <Tree.HasDisclosures>
                            <FernButtonGroup>
                              <Tree.CollapseAll asChild>
                                <Button size="iconXs" variant="ghost">
                                  <ChevronsDownUp />
                                </Button>
                              </Tree.CollapseAll>
                              <Tree.ExpandAll asChild>
                                <Button size="iconXs" variant="ghost">
                                  <ChevronsUpDown />
                                </Button>
                              </Tree.ExpandAll>
                            </FernButtonGroup>
                          </Tree.HasDisclosures>
                        }
                      >
                        {endpoint.pathParameters.map((parameter) => (
                          <ObjectProperty
                            key={parameter.key}
                            property={parameter}
                            types={types}
                          />
                        ))}
                      </EndpointSection>
                    </AnchorIdProvider>
                  </Tree.Root>
                )}

              {endpoint.queryParameters &&
                endpoint.queryParameters.length > 0 && (
                  <Tree.Root>
                    <AnchorIdProvider id="query">
                      <EndpointSection
                        title="Query parameters"
                        anchorIdParts={["request", "query"]}
                        slug={node.slug}
                        headerRight={
                          <Tree.HasDisclosures>
                            <FernButtonGroup>
                              <Tree.CollapseAll asChild>
                                <Button size="iconXs" variant="ghost">
                                  <ChevronsDownUp />
                                </Button>
                              </Tree.CollapseAll>
                              <Tree.ExpandAll asChild>
                                <Button size="iconXs" variant="ghost">
                                  <ChevronsUpDown />
                                </Button>
                              </Tree.ExpandAll>
                            </FernButtonGroup>
                          </Tree.HasDisclosures>
                        }
                      >
                        {endpoint.queryParameters.map((parameter) => (
                          <ObjectProperty
                            key={parameter.key}
                            property={parameter}
                            types={types}
                          />
                        ))}
                      </EndpointSection>
                    </AnchorIdProvider>
                  </Tree.Root>
                )}

              {endpoint.requests?.[0] && (
                <Tree.Root>
                  <EndpointSection
                    title="Request"
                    anchorIdParts={["request"]}
                    slug={node.slug}
                    description={endpoint.requests[0].description}
                    headerRight={
                      <div className="flex items-center gap-2">
                        {endpoint.requests[0].contentType && (
                          <Badge size="sm" className="font-mono">
                            {endpoint.requests[0].contentType}
                          </Badge>
                        )}
                        <Tree.HasDisclosures>
                          <FernButtonGroup>
                            <Tree.CollapseAll asChild>
                              <Button size="iconXs" variant="ghost">
                                <ChevronsDownUp />
                              </Button>
                            </Tree.CollapseAll>
                            <Tree.ExpandAll asChild>
                              <Button size="iconXs" variant="ghost">
                                <ChevronsUpDown />
                              </Button>
                            </Tree.ExpandAll>
                          </FernButtonGroup>
                        </Tree.HasDisclosures>
                      </div>
                    }
                  >
                    <AnchorIdProvider id="body">
                      <HttpRequestBody
                        body={endpoint.requests[0].body}
                        types={types}
                      />
                    </AnchorIdProvider>
                  </EndpointSection>
                </Tree.Root>
              )}
            </HoverPropertyContext.Provider>
          </AnchorIdProvider>

          <AnchorIdProvider id="response">
            <HoverPropertyContext.Provider value={onHoverResponseProperty}>
              {endpoint.responses?.[0] && (
                <Tree.Root>
                  <EndpointSection
                    title="Response"
                    anchorIdParts={["response"]}
                    slug={node.slug}
                    description={endpoint.responses[0].description}
                    headerRight={
                      <>
                        <StatusCodeBadge
                          statusCode={endpoint.responses[0].statusCode}
                          className="ml-2 mr-auto"
                          variant="outlined"
                        />
                        <Tree.HasDisclosures>
                          <FernButtonGroup>
                            <Tree.CollapseAll asChild>
                              <Button size="iconXs" variant="ghost">
                                <ChevronsDownUp />
                              </Button>
                            </Tree.CollapseAll>
                            <Tree.ExpandAll asChild>
                              <Button size="iconXs" variant="ghost">
                                <ChevronsUpDown />
                              </Button>
                            </Tree.ExpandAll>
                          </FernButtonGroup>
                        </Tree.HasDisclosures>
                      </>
                    }
                  >
                    <AnchorIdProvider id="body">
                      <HttpResponseBody
                        key={endpoint.responses[0].statusCode}
                        body={endpoint.responses[0].body}
                        types={types}
                      />
                    </AnchorIdProvider>
                  </EndpointSection>
                </Tree.Root>
              )}
            </HoverPropertyContext.Provider>
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
    <AnchorIdProvider id={property.key}>
      <JsonPathPartProvider
        value={{ type: "objectProperty", propertyName: property.key }}
      >
        <Tree.Item
          defaultOpen={isDefaultOpen(property.valueShape, types)}
          unbranched={unwrapped.shape.type === "enum"}
        >
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
              <ParameterInfo
                parameterName={property.key}
                indent={indent}
                property={property}
                types={types}
              />
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
      </JsonPathPartProvider>
    </AnchorIdProvider>
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

const ParameterInfo = forwardRef<
  HTMLDivElement,
  Omit<ComponentPropsWithoutRef<typeof Parameter.Root>, "property"> & {
    parameterName: string;
    indent: number;
    property: ApiDefinition.ObjectProperty;
    types: Record<string, ApiDefinition.TypeDefinition>;
  }
>(({ parameterName, indent, property, types, ...props }, ref) => {
  const jsonpath = useContext(JsonPathPartContext).current ?? [];
  const onHoverProperty = useContext(HoverPropertyContext);
  const slug = useContext(SlugContext);
  const anchorId = useAnchorId() ?? property.key;
  const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
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
          console.log(parent);
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
                (window.innerHeight || document.documentElement.clientHeight) &&
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
      {...props}
      className={cn("flex-1", props.className)}
      ref={ref}
      onPointerEnter={() => onHoverProperty(jsonpath, { isHovering: true })}
      onPointerLeave={() => onHoverProperty(jsonpath, { isHovering: false })}
      onFocus={() => onHoverProperty(jsonpath, { isHovering: true })}
      onBlur={() => onHoverProperty(jsonpath, { isHovering: false })}
    >
      <Parameter.Name
        ref={nameRef}
        parameterName={property.key}
        className={cn("scroll-m-4", {
          "-mx-2": indent === 0,
          "-mr-2": indent > 0,
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
        <AvailabilityBadge availability={unwrapped.availability} size="sm" />
      )}
      <Parameter.Status
        status={!unwrapped.isOptional ? "required" : "optional"}
      />
    </Parameter.Root>
  );
});

ParameterInfo.displayName = "ParameterInfo";

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
      return "Show child attributes";
    case "map":
      return "Show child attributes";
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
    case "set":
      return (
        <JsonPathPartProvider value={{ type: "listItem" }}>
          {renderTypeShape(property.itemShape, types, parentVisitedTypeIds)}
        </JsonPathPartProvider>
      );
    case "map":
      return (
        <JsonPathPartProvider value={{ type: "objectProperty" }}>
          {renderTypeShape(property.valueShape, types, parentVisitedTypeIds)}
        </JsonPathPartProvider>
      );
    case "enum":
      return <EnumCard values={property.values} />;
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
          <Tree.Card>
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
                      <div className="border-b border-[var(--grayscale-a6)] pb-2 leading-normal">
                        {(variant.displayName || variant.availability) && (
                          <div className="flex items-center">
                            {variant.displayName && (
                              <h6 className="mb-0">{variant.displayName}</h6>
                            )}
                            {variant.availability && (
                              <AvailabilityBadge
                                availability={variant.availability}
                                size="sm"
                                className="ml-auto"
                              />
                            )}
                          </div>
                        )}
                        <Markdown size="sm" mdx={description} />
                      </div>
                    )}
                    {renderTypeShape(
                      variant.shape,
                      types,
                      parentVisitedTypeIds
                    ) || (
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
          <Tree.Card>
            <Tree.Variants>
              {property.variants.map((variant) => {
                const description =
                  variant.description ??
                  ApiDefinition.unwrapObjectType(
                    variant,
                    types,
                    parentVisitedTypeIds
                  ).descriptions[0];
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
                        <div className="border-b border-[var(--grayscale-a6)] pb-2 leading-normal">
                          {(variant.displayName || variant.availability) && (
                            <div className="flex items-center">
                              {variant.displayName && (
                                <h6 className="mb-0">{variant.displayName}</h6>
                              )}
                              {variant.availability && (
                                <AvailabilityBadge
                                  availability={variant.availability}
                                  size="sm"
                                  className="ml-auto"
                                />
                              )}
                            </div>
                          )}
                          <Markdown size="sm" mdx={description} />
                        </div>
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
                      />
                      <ObjectTypeShape
                        shape={variant}
                        types={types}
                        parentVisitedTypeIds={parentVisitedTypeIds}
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

function EnumCard({ values }: { values: ApiDefinition.EnumValue[] }) {
  const [searchInput, setSearchInput] = useState("");
  return (
    <Tree.Content>
      <Tree.Card>
        {values.length > 10 && (
          <div className="p-2 pb-0">
            <FernInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter"
              leftIcon={<ListFilter className="text-text-disabled size-4" />}
            />
          </div>
        )}
        <EnumDefinitionDetails className="p-4" searchInput={searchInput}>
          {values.map((value) => (
            <Chip
              key={value.value}
              description={value.description}
              className="font-mono"
            >
              {value.value}
            </Chip>
          ))}
        </EnumDefinitionDetails>
      </Tree.Card>
    </Tree.Content>
  );
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
        <Tree.Content notLast>
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
          : String(unwrapped.shape.value.value);
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
          ? `Literal["${unwrapped.shape.value.value}"]`
          : capitalize(String(unwrapped.shape.value.value));
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
