import cn from "clsx";
import { forwardRef, memo, useCallback, useMemo, useRef, useState } from "react";
import { AbsolutelyPositionedAnchor } from "../../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { useRouteListener } from "../../../contexts/useRouteListener";
import { getAnchorId } from "../../../util/anchor";
import { ResolvedObjectProperty, ResolvedTypeDefinition } from "../../../util/resolver";
import { ApiPageDescription } from "../../ApiPageDescription";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext
} from "../context/TypeDefinitionContext";
import {
    hasInternalTypeReference, InternalTypeReferenceDefinitions
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
    return (
        <div
            ref={ref}
            data-route={anchorRoute.toLowerCase()}
            className={cn("py-3 scroll-mt-header-height-padded space-y-2", {
                "px-3": !contextValue.isRootTypeDefinition,
                "outline-accent-primary outline-1 outline outline-offset-4 rounded-sm": isActive,
            })}
        >
            <div className="flex items-baseline gap-2">
                <div className="group/anchor-container relative inline-flex items-center">
                    <AbsolutelyPositionedAnchor href={anchorRoute} smallGap />
                    <MonospaceText
                        className={cn("t-default text-sm", {
                            "t-accent": isActive,
                        })}
                        onMouseEnter={onMouseEnterPropertyName}
                        onMouseOut={onMouseOutPropertyName}
                    >
                        {property.key}
                    </MonospaceText>
                </div>
                {renderTypeShorthandRoot(property.valueShape, types, contextValue.isResponse)}
                {property.availability != null && (
                    <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                )}
            </div>
            {property.description && (
                <ApiPageDescription isMarkdown={true} description={property.description} className="text-sm" />
            )}
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
