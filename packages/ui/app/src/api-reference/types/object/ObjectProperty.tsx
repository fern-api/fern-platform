import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import cn from "clsx";
import { forwardRef, memo, useCallback, useMemo, useRef, useState } from "react";
import { useIsApiReferencePaginated, useRouteListener } from "../../../atoms";
import { FernAnchor } from "../../../components/FernAnchor";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { useHref } from "../../../hooks/useHref";
import { Markdown } from "../../../mdx/Markdown";
import { ResolvedObjectProperty, ResolvedTypeDefinition, unwrapDescription } from "../../../resolver/types";
import { getAnchorId } from "../../../util/anchor";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
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
import { renderDeprecatedTypeShorthandRoot } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectProperty {
    export interface Props {
        property: ResolvedObjectProperty;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        applyErrorStyles: boolean;
        types: Record<string, ResolvedTypeDefinition>;
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
                ref.current?.scrollIntoView({ block: "start", behavior: isPaginated ? "smooth" : "instant" });
            }, 450);
        }
    });

    return <ObjectPropertyInternal ref={ref} anchorId={anchorId} isActive={isActive} {...props} />;
};

interface ObjectPropertyInternalProps extends ObjectProperty.Props {
    anchorId: string;
    isActive: boolean;
}

const UnmemoizedObjectPropertyInternal = forwardRef<HTMLDivElement, ObjectPropertyInternalProps>((props, ref) => {
    const { slug, property, applyErrorStyles, types, anchorIdParts, anchorId, isActive } = props;
    const contextValue = useTypeDefinitionContext();
    const jsonPropertyPath = useMemo(
        (): JsonPropertyPath => [
            ...contextValue.jsonPropertyPath,
            {
                type: "objectProperty",
                propertyName: property.key,
            },
        ],
        [contextValue.jsonPropertyPath, property.key],
    );
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath,
        }),
        [contextValue, jsonPropertyPath],
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

    const description = useMemo(() => {
        if (property.description != null) {
            return property.description;
        }

        return unwrapDescription(property.valueShape, types);
    }, [property.description, property.valueShape, types]);

    return (
        <div
            ref={ref}
            id={href}
            className={cn("scroll-mt-content-padded fern-api-property", {
                "px-3": !contextValue.isRootTypeDefinition,
                "outline-accent outline-1 outline outline-offset-4 rounded-sm": isActive,
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
                {renderDeprecatedTypeShorthandRoot(property.valueShape, types, contextValue.isResponse)}
                {property.availability != null && (
                    <EndpointAvailabilityTag availability={property.availability} minimal={true} />
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
            <Markdown mdx={description} size="sm" />
            {hasInternalTypeReference(property.valueShape, types) && !hasInlineEnum(property.valueShape, types) && (
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

UnmemoizedObjectPropertyInternal.displayName = "UnmemoizedObjectPropertyInternal";

export const ObjectPropertyInternal = memo(UnmemoizedObjectPropertyInternal);
