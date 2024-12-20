import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import cn from "clsx";
import { compact } from "es-toolkit/array";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { capturePosthogEvent } from "../../../analytics/posthog";
import { useIsApiReferencePaginated, useRouteListener } from "../../../atoms";
import { FernAnchor } from "../../../components/FernAnchor";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { useHref } from "../../../hooks/useHref";
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
  const isPaginated = useIsApiReferencePaginated();
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

  const onMouseEnterPropertyName = useMemo(() => {
    if (contextValue.onHoverProperty == null) {
      return undefined;
    }
    const { onHoverProperty } = contextValue;
    return () => {
      onHoverProperty(jsonPropertyPath, { isHovering: true });
    };
  }, [contextValue, jsonPropertyPath]);

  const onMouseOutPropertyName = useMemo(() => {
    if (contextValue.onHoverProperty == null) {
      return undefined;
    }
    const { onHoverProperty } = contextValue;
    return () => {
      onHoverProperty(jsonPropertyPath, { isHovering: false });
    };
  }, [contextValue, jsonPropertyPath]);

  const href = useHref(slug, anchorId);

  const descriptions = useMemo(() => {
    const unwrapped = ApiDefinition.unwrapReference(property.valueShape, types);
    return compact([property.description, ...unwrapped.descriptions]);
  }, [property.description, property.valueShape, types]);

  useEffect(() => {
    if (descriptions.length > 0) {
      capturePosthogEvent("api_reference_multiple_descriptions", {
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
      className={cn("scroll-mt-content-padded fern-api-property", {
        "px-3": !contextValue.isRootTypeDefinition,
        "outline-accent rounded-sm outline outline-1 outline-offset-4":
          isActive,
      })}
    >
      <div className="fern-api-property-header">
        <FernAnchor href={href} sideOffset={6}>
          <span
            className="fern-api-property-key"
            onMouseEnter={onMouseEnterPropertyName}
            onMouseOut={onMouseOutPropertyName}
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
        <FernErrorBoundary component="ObjectProperty">
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
        </FernErrorBoundary>
      )}
      <Markdown mdx={descriptions[0]} size="sm" />
      {hasInternalTypeReference(property.valueShape, types) &&
        !hasInlineEnum(property.valueShape, types) && (
          <FernErrorBoundary component="ObjectProperty">
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
          </FernErrorBoundary>
        )}
    </div>
  );
});

UnmemoizedObjectPropertyInternal.displayName =
  "UnmemoizedObjectPropertyInternal";

export const ObjectPropertyInternal = memo(UnmemoizedObjectPropertyInternal);
