import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { MarkdownText } from "@fern-api/fdr-sdk/docs";
import {
  AvailabilityBadge,
  Badge,
  Button,
  cn,
  CopyToClipboardButton,
  Disclosure,
  toast,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  TouchScreenOnly,
} from "@fern-docs/components";
import { composeEventHandlers } from "@radix-ui/primitive";
import { atom, useAtomValue } from "jotai";
import { ChevronDown, LinkIcon, Plus } from "lucide-react";
import {
  ComponentPropsWithoutRef,
  forwardRef,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { UnreachableCaseError } from "ts-essentials";
import { useMemoOne } from "use-memo-one";
import { IS_READY_ATOM, LOCATION_ATOM } from "../../atoms";
import { Chip } from "../../components/Chip";
import { Markdown } from "../../mdx/Markdown";
import { isMdxEmpty } from "../../mdx/MdxContent";
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
  isTypeShapeDetailsOpenByDefault,
  showChildAttributesMessage,
  typeShapeHasChildren,
  typeShapeShouldHideBranch,
} from "./utils";

function shouldLazyLoad(
  visitedTypeIds: Set<string>,
  newVisitedTypeIds: Set<string>
) {
  return [...newVisitedTypeIds].some((id) => visitedTypeIds.has(id));
}

export function TypeShape({
  shape,
  renderFallback,
}: {
  shape: ApiDefinition.TypeShape;
  renderFallback?: () => React.ReactNode;
}) {
  const visitedTypeIds = useVisitedTypeIds();
  const types = useTypeDefinitions();
  if (shape.type === "alias") {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    if (shouldLazyLoad(visitedTypeIds, unwrapped.visitedTypeIds)) {
      return (
        <VisitedTypeIdsProvider value={unwrapped.visitedTypeIds}>
          <Disclosure.Details className="list-none">
            <Disclosure.Summary>
              <Disclosure.If open={false}>
                <Disclosure.Trigger asChild>
                  <Badge variant="subtle" interactive>
                    <ChevronDown />
                    {`Show ${unwrapped.shape.type}`}
                  </Badge>
                </Disclosure.Trigger>
              </Disclosure.If>
            </Disclosure.Summary>
            <Disclosure.LazyContent>
              {() => (
                <DereferencedShape
                  shape={unwrapped.shape}
                  renderFallback={renderFallback}
                />
              )}
            </Disclosure.LazyContent>
          </Disclosure.Details>
        </VisitedTypeIdsProvider>
      );
    }
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
  const indent = Tree.useIndent();
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
        <Tree.BranchGrid hideBranch={indent === 0}>
          {required.map((property) => (
            <Tree.Branch key={property.key}>
              <ObjectProperty property={property} />
            </Tree.Branch>
          ))}
        </Tree.BranchGrid>
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
      <Tree.BranchGrid hideBranch={indent === 0}>
        {properties.map((property, idx) => (
          <Tree.Branch key={property.key} last={idx === properties.length - 1}>
            <ObjectProperty property={property} />
          </Tree.Branch>
        ))}
      </Tree.BranchGrid>
    </VisitedTypeIdsProvider>
  );
}

enum ExpandMode {
  /**
   * in the initial state, the tree is partially expanded (description is visible, but children are collapsed)
   */
  Intial,
  /**
   * in the open state, the tree is fully expanded (description and children are visible)
   */
  Open,
  /**
   * in the closed state, the tree is fully collapsed (description and children are hidden)
   */
  Closed,
}

export const ObjectProperty = memo(
  ({ property }: { property: ApiDefinition.ObjectProperty }) => {
    const [expandMode, setExpandMode] = useState<ExpandMode>(ExpandMode.Intial);
    const indent = Tree.useIndent();
    const types = useTypeDefinitions();
    const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
    const description = property.description ?? unwrapped.descriptions[0];
    const hideBranch = typeShapeShouldHideBranch(property.valueShape, types);
    const hasChildren = typeShapeHasChildren(property.valueShape, types);

    return (
      <AnchorIdProvider value={property.key}>
        <JsonPathPartProvider
          value={{ type: "objectProperty", propertyName: property.key }}
        >
          <Tree.Item
            asChild={hasChildren}
            className={cn(
              indent === 0 && "-mx-2",
              hasChildren && "mb-4 space-y-2"
            )}
          >
            <Tree.Details
              defaultOpen={isTypeShapeDetailsOpenByDefault(
                property.valueShape,
                types
              )}
              className={cn("mb-4", indent)}
              onOpenChange={(open) => {
                if (open) {
                  setExpandMode(ExpandMode.Open);
                } else {
                  setExpandMode(ExpandMode.Closed);
                }
              }}
              open={expandMode === ExpandMode.Open || !hasChildren}
            >
              <Tree.DetailsSummary className="relative">
                <Tree.DetailsTrigger asChild>
                  <ParameterInfo
                    parameterName={property.key}
                    property={property}
                    unwrapped={unwrapped}
                    className="my-2"
                    hideIndicator={!hasChildren}
                  />
                </Tree.DetailsTrigger>
                <Tree.BranchGrid
                  hideBranch={hideBranch}
                  className={cn(hideBranch && "pl-2")}
                >
                  {!isMdxEmpty(description) && (
                    <Tree.Branch lineOnly>
                      <Markdown
                        size="sm"
                        className={cn("text-text-muted mb-3 leading-normal")}
                        mdx={description}
                      />
                    </Tree.Branch>
                  )}
                  <Disclosure.If open={false}>
                    <Tree.Branch last>
                      <Disclosure.Trigger asChild>
                        <Badge
                          rounded
                          interactive
                          className="mt-2 w-fit font-normal"
                          variant={hideBranch ? "subtle" : "ghost"}
                        >
                          <Plus />
                          {showChildAttributesMessage(
                            property.valueShape,
                            types
                          ) ?? "Show child attributes"}
                        </Badge>
                      </Disclosure.Trigger>
                    </Tree.Branch>
                  </Disclosure.If>
                </Tree.BranchGrid>
              </Tree.DetailsSummary>
              {hasChildren && (
                <Tree.DetailsContent>
                  <TypeShape shape={property.valueShape} />
                </Tree.DetailsContent>
              )}
            </Tree.Details>
          </Tree.Item>
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
    );
  }
);

DiscriminatedUnionShape.displayName = "DiscriminatedUnionShape";

const UndiscriminatedUnionShape = memo(
  (props: { shape: ApiDefinition.UndiscriminatedUnionType }) => {
    const { shape } = props;
    const types = useTypeDefinitions();
    return (
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
              // className={cn(
              //   "flex flex-wrap gap-3",
              //   !values.slice(0, 10).every((v) => !v.description) && "flex-col"
              // )}
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
  hideIndicator?: boolean;
};

const ParameterInfo = memo(
  forwardRef<HTMLDivElement, ParameterInfoProps>((props, ref) => {
    const { parameterName, property, unwrapped, hideIndicator, ...rest } =
      props;

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
    // const setLocation = useSetAtom(LOCATION_ATOM);
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
              // const rect = nameRef.current.getBoundingClientRect();
              // const isVisible =
              //   rect.top >= 0 &&
              //   rect.left >= 0 &&
              //   rect.bottom <=
              //     (window.innerHeight ||
              //       document.documentElement.clientHeight) &&
              //   rect.right <=
              //     (window.innerWidth || document.documentElement.clientWidth);
              // if (!isVisible) {
              //   nameRef.current.scrollIntoView({
              //     behavior: "smooth",
              //     block: "center",
              //   });
              // }
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

    const availability = property.availability ?? unwrapped.availability;

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
        asChild
      >
        <Badge
          className="relative w-full"
          interactive={false}
          variant={isActive ? "subtle" : "ghost"}
        >
          <Tree.DetailsIndicator
            hidden={hideIndicator}
            className="absolute -left-2"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  ref={nameRef}
                  className={cn(
                    "shrink-0 cursor-default scroll-m-4 font-semibold hover:underline hover:decoration-dashed",
                    {
                      "line-through": property.availability === "Deprecated",
                      "text-[var(--accent-a12)]":
                        property.availability !== "Deprecated",
                      "text-[var(--grayscale-a9)]":
                        property.availability === "Deprecated",
                    }
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    void navigator.clipboard
                      .writeText(property.key)
                      .then(() => {
                        toast.info(`Copied "${property.key}" to clipboard`);
                      });
                  }}
                >
                  {property.key}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Copy{" "}
                <span className="font-mono font-semibold">{property.key}</span>{" "}
                to clipboard
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TypeAnnotation
            shape={unwrapped.shape}
            isOptional={unwrapped.isOptional}
            className="text-text-muted text-xs font-normal"
          />

          {unwrapped.default != null &&
            unwrapped.shape.type !== "literal" &&
            typeof unwrapped.default !== "object" && (
              <span className="ml-2 font-mono">
                {`= ${JSON.stringify(unwrapped.default)}`}
              </span>
            )}

          {availability && (
            <AvailabilityBadge
              availability={availability}
              size="sm"
              className="self-baseline"
            />
          )}

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
        </Badge>
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
