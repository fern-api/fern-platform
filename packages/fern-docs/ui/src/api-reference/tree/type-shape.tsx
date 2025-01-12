import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { MarkdownText } from "@fern-api/fdr-sdk/docs";
import {
  AvailabilityBadge,
  Badge,
  Button,
  cn,
  CopyToClipboardButton,
  Disclosure,
  TouchScreenOnly,
} from "@fern-docs/components";
import { composeEventHandlers } from "@radix-ui/primitive";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { ChevronDown, LinkIcon } from "lucide-react";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  memo,
  useEffect,
  useRef,
} from "react";
import { UnreachableCaseError } from "ts-essentials";
import { useMemoOne } from "use-memo-one";
import { IS_READY_ATOM, LOCATION_ATOM } from "../../atoms";
import { Chip } from "../../components/Chip";
import { Markdown } from "../../mdx/Markdown";
import {
  AnchorIdProvider,
  JsonPathPartProvider,
  useAnchorId,
  useJsonPathPart,
  useSlug,
  useTypeDefinitions,
  useVisitedTypeIds,
  VisitedTypeIdsProvider,
} from "./contexts";
import { Parameter } from "./parameter";
import { Tree } from "./tree";
import { TypeAnnotation } from "./type-annotation";
import {
  collectExpectedTypeIds,
  isTypeShapeDetailsOpenByDefault,
  showChildAttributesMessage,
  typeShapeHasChildren,
} from "./utils";

export function TypeShape({
  shape,
  renderFallback,
}: {
  shape: ApiDefinition.TypeShape;
  renderFallback?: () => React.ReactNode;
}) {
  const types = useTypeDefinitions();
  if (shape.type === "alias") {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    return (
      <VisitedTypeIdsProvider value={unwrapped.visitedTypeIds}>
        <DereferencedShape
          shape={unwrapped.shape}
          renderFallback={renderFallback}
        />
      </VisitedTypeIdsProvider>
    );
  }

  return <DereferencedShape shape={shape} renderFallback={renderFallback} />;
}

export function DereferencedShape({
  shape,
  renderFallback,
}: {
  shape: ApiDefinition.DereferencedNonOptionalTypeShapeOrReference;
  renderFallback?: () => React.ReactNode;
}) {
  switch (shape.type) {
    case "literal":
    case "primitive":
    case "unknown":
      return renderFallback?.();
    case "list":
    case "set": {
      return (
        <JsonPathPartProvider value={{ type: "listItem" }}>
          <TypeShape shape={shape.itemShape} />
        </JsonPathPartProvider>
      );
    }
    case "map": {
      return (
        <JsonPathPartProvider value={{ type: "objectProperty" }}>
          <TypeShape shape={shape.valueShape} />
        </JsonPathPartProvider>
      );
    }
    case "enum":
      return <EnumList values={shape.values} />;
    case "object": {
      return <ObjectTypeShape shape={shape} />;
    }
    case "undiscriminatedUnion":
      return <UndiscriminatedUnionShape shape={shape} />;
    case "discriminatedUnion":
      return <DiscriminatedUnionShape shape={shape} />;
    default:
      console.error(new UnreachableCaseError(shape));
      return renderFallback?.();
  }
}

export function ObjectTypeShape({
  shape,
  expanded = false,
}: {
  shape:
    | ApiDefinition.TypeShape.Object_
    | ApiDefinition.DiscriminatedUnionVariant;
  expanded?: boolean;
}) {
  const types = useTypeDefinitions();
  const { properties, extraProperties, visitedTypeIds } =
    ApiDefinition.unwrapObjectType(shape, types);

  const required = properties.filter(
    (property) =>
      !ApiDefinition.unwrapReference(property.valueShape, types).isOptional
  );

  const optional = properties.filter(
    (property) =>
      ApiDefinition.unwrapReference(property.valueShape, types).isOptional
  );

  if (required.length && optional.length > 1 && !expanded) {
    return (
      <VisitedTypeIdsProvider value={visitedTypeIds}>
        <Tree.Content notLast>
          {required.map((property) => (
            <ObjectProperty key={property.key} property={property} />
          ))}
        </Tree.Content>
        <Tree.CollapsedContent
          defaultOpen={optional.length === 1}
          // className={cn(indent === 0 && "pl-2")}
        >
          {optional.map((property) => (
            <ObjectProperty key={property.key} property={property} />
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
            />
          )}
        </Tree.CollapsedContent>
      </VisitedTypeIdsProvider>
    );
  }

  return (
    <VisitedTypeIdsProvider value={visitedTypeIds}>
      <Tree.Content>
        {properties.map((property) => (
          <ObjectProperty key={property.key} property={property} />
        ))}
      </Tree.Content>
    </VisitedTypeIdsProvider>
  );
}

export const ObjectProperty = memo(
  ({ property }: { property: ApiDefinition.ObjectProperty }) => {
    const indent = Tree.useIndent();
    const types = useTypeDefinitions();
    const visitedTypeIds = useVisitedTypeIds();
    const expectedTypeIds = collectExpectedTypeIds(property.valueShape, types);
    const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
    const availability = property.availability ?? unwrapped.availability;

    const lazy = [...expectedTypeIds].some((id) => visitedTypeIds.has(id));

    return (
      <AnchorIdProvider value={property.key}>
        <JsonPathPartProvider
          value={{ type: "objectProperty", propertyName: property.key }}
        >
          {typeShapeHasChildren(property.valueShape, types, visitedTypeIds) ? (
            <Tree.Item asChild className={cn(indent === 0 && "-ml-2")}>
              <Tree.Details
                defaultOpen={isTypeShapeDetailsOpenByDefault(
                  property.valueShape,
                  types
                )}
                className={cn("mb-4", indent)}
                summary={
                  <Tree.DetailsSummary className="relative">
                    <Tree.DetailsIndicator className="absolute -left-2 top-1" />
                    <Tree.DetailsTrigger asChild>
                      <ParameterInfo
                        parameterName={property.key}
                        property={property}
                        unwrapped={unwrapped}
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
                          mdx={
                            property.description ?? unwrapped.descriptions[0]
                          }
                        />
                      </div>
                    </Tree.SummaryIndentedContent>
                    <Tree.ExpandChildrenButton>
                      {showChildAttributesMessage(property.valueShape, types)}
                    </Tree.ExpandChildrenButton>
                  </Tree.DetailsSummary>
                }
                lazy={true}
              >
                {() => <TypeShape shape={property.valueShape} />}
              </Tree.Details>
            </Tree.Item>
          ) : (
            <Tree.Item
              className={cn("mb-4 space-y-2", indent === 0 && "-ml-2")}
            >
              <ParameterInfo
                parameterName={property.key}
                property={property}
                unwrapped={unwrapped}
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

const DiscriminatedUnionShape = memo(
  ({ shape }: { shape: ApiDefinition.DiscriminatedUnionType }) => {
    const types = useTypeDefinitions();
    return (
      <Tree.Content>
        <Tree.Card className="my-2">
          <Tree.Variants>
            {shape.variants.map((variant) => {
              const description =
                variant.description ??
                ApiDefinition.unwrapObjectType(variant, types).descriptions[0];
              return (
                <AnchorIdProvider
                  value={variant.discriminantValue}
                  key={variant.discriminantValue}
                >
                  <JsonPathPartProvider
                    value={{
                      type: "objectFilter",
                      propertyName: shape.discriminant,
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
                        key: ApiDefinition.PropertyKey(shape.discriminant),
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
                    />
                    <Disclosure.Details className="list-none">
                      <Disclosure.Summary>
                        <Disclosure.If open={false}>
                          <Disclosure.Trigger asChild>
                            <Badge variant="subtle" interactive>
                              <ChevronDown />
                              {`Show ${
                                ApiDefinition.unwrapObjectType(variant, types)
                                  .properties.length
                              } attributes`}
                            </Badge>
                          </Disclosure.Trigger>
                        </Disclosure.If>
                      </Disclosure.Summary>
                      <Disclosure.LazyContent>
                        {() => <ObjectTypeShape shape={variant} expanded />}
                      </Disclosure.LazyContent>
                    </Disclosure.Details>
                  </JsonPathPartProvider>
                </AnchorIdProvider>
              );
            })}
          </Tree.Variants>
        </Tree.Card>
      </Tree.Content>
    );
  }
);

DiscriminatedUnionShape.displayName = "DiscriminatedUnionShape";

const UndiscriminatedUnionShape = memo(
  (props: { shape: ApiDefinition.UndiscriminatedUnionType }) => {
    const { shape } = props;
    const types = useTypeDefinitions();
    return (
      <Tree.Content>
        <Tree.Card className="my-2">
          <Tree.Variants>
            {shape.variants.map((variant, idx) => {
              const description =
                variant.description ??
                ApiDefinition.unwrapReference(variant.shape, types)
                  .descriptions[0];
              return (
                <AnchorIdProvider
                  value={variant.displayName ?? String(idx)}
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
                  <TypeShape
                    shape={variant.shape}
                    renderFallback={() => (
                      <span className="text-text-muted text-xs">
                        <TypeAnnotation
                          shape={variant.shape}
                          isOptional={false}
                        />
                      </span>
                    )}
                  />
                </AnchorIdProvider>
              );
            })}
          </Tree.Variants>
        </Tree.Card>
      </Tree.Content>
    );
  }
);

UndiscriminatedUnionShape.displayName = "UndiscriminatedUnionShape";

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
              <Disclosure.Trigger asChild>
                <Badge variant="subtle" interactive>
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

type ParameterInfoProps = Omit<
  ComponentPropsWithoutRef<typeof Parameter.Root>,
  "property"
> & {
  parameterName: string;
  property: ApiDefinition.ObjectProperty;
  unwrapped: ApiDefinition.UnwrappedReference;
};

const ParameterInfo = memo(
  forwardRef<HTMLDivElement, ParameterInfoProps>((props, ref) => {
    const { parameterName, property, unwrapped, ...rest } = props;

    const jsonpath = useJsonPathPart();
    const slug = useSlug();
    const anchorId = useAnchorId() ?? parameterName;

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

    const dispatchHoverEvent = (isHovering: boolean) => {
      window.dispatchEvent(
        new CustomEvent("hover-json-property", {
          detail: {
            slug,
            jsonpath,
            isHovering,
            type: anchorId.startsWith("request") ? "request" : "response",
          },
        })
      );
    };

    return (
      <Parameter.Root
        ref={ref}
        {...rest}
        onPointerEnter={composeEventHandlers(props.onPointerEnter, () => {
          dispatchHoverEvent(true);
        })}
        onPointerLeave={composeEventHandlers(props.onPointerLeave, () => {
          dispatchHoverEvent(false);
        })}
        onFocus={composeEventHandlers(props.onFocus, () => {
          dispatchHoverEvent(true);
        })}
        onBlur={composeEventHandlers(props.onBlur, () => {
          dispatchHoverEvent(false);
        })}
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
          <TypeAnnotation
            shape={unwrapped.shape}
            isOptional={unwrapped.isOptional}
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
  })
);

ParameterInfo.displayName = "ParameterInfo";

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
