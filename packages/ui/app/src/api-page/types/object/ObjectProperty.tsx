import cn from "clsx";
import { forwardRef, memo, useCallback, useMemo, useRef, useState } from "react";
import { AbsolutelyPositionedAnchor } from "../../../commons/AbsolutelyPositionedAnchor";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { useRouteListener } from "../../../contexts/useRouteListener";
import { ResolvedObjectProperty, ResolvedTypeDefinition, unwrapDescription } from "../../../resolver/types";
import { getAnchorId } from "../../../util/anchor";
import { ApiPageDescription } from "../../ApiPageDescription";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import {
    InternalTypeReferenceDefinitions,
    hasInternalTypeReference,
} from "../type-reference/InternalTypeReferenceDefinitions";
import { renderTypeShorthandRoot } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectProperty {
    export interface Props {
        property: ResolvedObjectProperty;
        anchorIdParts: readonly string[];
        route: string;
        applyErrorStyles: boolean;
        defaultExpandAll?: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = (props) => {
    const { route, anchorIdParts } = props;
    const anchorId = getAnchorId(anchorIdParts);
    const ref = useRef<HTMLDivElement>(null);

    const [isActive, setIsActive] = useState(false);
    useRouteListener(route, (anchor) => {
        const isActive = anchor === anchorId;
        setIsActive(isActive);
        if (isActive) {
            setTimeout(() => {
                ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
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
    const { route, property, applyErrorStyles, defaultExpandAll, types, anchorIdParts, anchorId, isActive } = props;
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

    const anchorRoute = `${route}#${anchorId}`;

    const description = useMemo(() => {
        if (property.description != null) {
            return property.description;
        }

        return unwrapDescription(property.valueShape, types);
    }, [property.description, property.valueShape, types]);

    return (
        <div
            ref={ref}
            data-route={anchorRoute.toLowerCase()}
            className={cn("py-3 scroll-mt-content-padded space-y-2", {
                "px-3": !contextValue.isRootTypeDefinition,
                "outline-accent outline-1 outline outline-offset-4 rounded-sm": isActive,
            })}
        >
            <div className="flex items-baseline gap-2">
                <div className="group/anchor-container relative inline-flex items-center">
                    <AbsolutelyPositionedAnchor href={anchorRoute} />
                    <span
                        className="fern-api-property-key"
                        onMouseEnter={onMouseEnterPropertyName}
                        onMouseOut={onMouseOutPropertyName}
                    >
                        {property.key}
                    </span>
                </div>
                {renderTypeShorthandRoot(property.valueShape, types, contextValue.isResponse, "t-muted")}
                {property.availability != null && (
                    <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                )}
            </div>
            <ApiPageDescription isMarkdown={true} description={description} className="text-sm" />
            {hasInternalTypeReference(property.valueShape, types) && (
                <FernErrorBoundary component="ObjectProperty">
                    <TypeDefinitionContext.Provider value={newContextValue}>
                        <InternalTypeReferenceDefinitions
                            shape={property.valueShape}
                            isCollapsible
                            applyErrorStyles={applyErrorStyles}
                            anchorIdParts={anchorIdParts}
                            route={route}
                            defaultExpandAll={defaultExpandAll}
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
