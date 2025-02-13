import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import cn from "clsx";
import { compact } from "es-toolkit/array";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import { addLeadingSlash } from "@fern-docs/utils";

import { ErrorBoundary } from "@/components/error-boundary";

import { trackInternal } from "../../../analytics";
import { useRouteListener } from "../../../atoms";
import { FernAnchor } from "../../../components/FernAnchor";
import { Markdown } from "../../../mdx/Markdown";
import { renderTypeShorthandRoot } from "../../../type-shorthand";
import { getAnchorId } from "../../../util/anchor";
import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import {
  TypeDefinitionContext,
  TypeDefinitionContextValue,
  useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import {
  InternalTypeReferenceDefinitions,
  hasInlineEnum,
  hasInternalTypeReference,
} from "../type-reference/InternalTypeReferenceDefinitions";

export declare namespace ObjectProperty {
  export interface Props {
    property: ApiDefinition.ObjectProperty;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
    applyErrorStyles: boolean;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
  }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = (props) => {
  const { slug, anchorIdParts } = props;
  const anchorId = getAnchorId(anchorIdParts);
  const ref = useRef<HTMLDivElement>(null);

  const [isActive, setIsActive] = useState(false);
  const isPaginated = true; // TODO: useIsApiReferencePaginated();
  useRouteListener(slug, (anchor) => {
    const isActive = anchor === anchorId;
    setIsActive(isActive);
    if (isActive) {
      setTimeout(() => {
        ref.current?.scrollIntoView({
          block: "start",
          behavior: isPaginated ? "smooth" : "instant",
        });
      }, 450);
    }
  });

  return (
    <ObjectPropertyInternal
      ref={ref}
      anchorId={anchorId}
      isActive={isActive}
      {...props}
    />
  );
};

interface ObjectPropertyInternalProps extends ObjectProperty.Props {
  anchorId: string;
  isActive: boolean;
}

const UnmemoizedObjectPropertyInternal = forwardRef<
  HTMLDivElement,
  ObjectPropertyInternalProps
>((props, ref) => {
  const {
    slug,
    property,
    applyErrorStyles,
    types,
    anchorIdParts,
    anchorId,
    isActive,
  } = props;
  const contextValue = useTypeDefinitionContext();
  const jsonPropertyPath = useMemo(
    (): JsonPropertyPath => [
      ...contextValue.jsonPropertyPath,
      {
        type: "objectProperty",
        propertyName: property.key,
      },
    ],
    [contextValue.jsonPropertyPath, property.key]
  );
  const newContextValue = useCallback(
    (): TypeDefinitionContextValue => ({
      ...contextValue,
      jsonPropertyPath,
    }),
    [contextValue, jsonPropertyPath]
  );

  const href = `${addLeadingSlash(slug)}#${anchorId}`;

  const descriptions = useMemo(() => {
    const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
    return compact([property.description, ...unwrapped.descriptions]);
  }, [property.description, property.valueShape, types]);

  useEffect(() => {
    if (descriptions.length > 0) {
      trackInternal("api_reference_multiple_descriptions", {
        name: property.key,
        slug,
        anchorIdParts,
        count: descriptions.length,
        descriptions,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptions]);

  return (
    <div
      ref={ref}
      id={href}
      className={cn("fern-api-property scroll-mt-4", {
        "px-3": !contextValue.isRootTypeDefinition,
        "outline-accent rounded-sm outline outline-1 outline-offset-4":
          isActive,
      })}
    >
      <div className="fern-api-property-header">
        <FernAnchor href={href} sideOffset={6}>
          <span
            className="fern-api-property-key"
            onPointerEnter={() => {
              window.dispatchEvent(
                new CustomEvent(`property-hover-on:${slug}`, {
                  detail: jsonPropertyPath,
                })
              );
            }}
            onPointerOut={() => {
              window.dispatchEvent(
                new CustomEvent(`property-hover-off:${slug}`, {
                  detail: jsonPropertyPath,
                })
              );
            }}
          >
            {property.key}
          </span>
        </FernAnchor>
        {renderTypeShorthandRoot(
          property.valueShape,
          types,
          contextValue.isResponse
        )}
        {property.availability != null && (
          <AvailabilityBadge
            availability={property.availability}
            size="sm"
            rounded
          />
        )}
      </div>
      {hasInlineEnum(property.valueShape, types) && (
        <ErrorBoundary>
          <TypeDefinitionContext.Provider value={newContextValue}>
            <InternalTypeReferenceDefinitions
              shape={property.valueShape}
              isCollapsible
              applyErrorStyles={applyErrorStyles}
              anchorIdParts={anchorIdParts}
              slug={slug}
              types={types}
            />
          </TypeDefinitionContext.Provider>
        </ErrorBoundary>
      )}
      <Markdown mdx={descriptions[0]} size="sm" />
      {hasInternalTypeReference(property.valueShape, types) &&
        !hasInlineEnum(property.valueShape, types) && (
          <ErrorBoundary>
            <TypeDefinitionContext.Provider value={newContextValue}>
              <InternalTypeReferenceDefinitions
                shape={property.valueShape}
                isCollapsible
                applyErrorStyles={applyErrorStyles}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
              />
            </TypeDefinitionContext.Provider>
          </ErrorBoundary>
        )}
    </div>
  );
});

UnmemoizedObjectPropertyInternal.displayName =
  "UnmemoizedObjectPropertyInternal";

export const ObjectPropertyInternal = memo(UnmemoizedObjectPropertyInternal);
