import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { AbsolutelyPositionedAnchor } from "../../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { getAnchorId } from "../../../util/anchor";
import { ResolvedObjectProperty, ResolvedTypeDefinition } from "../../../util/resolver";
import { ApiPageDescription } from "../../ApiPageDescription";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import {
    hasInternalTypeReference,
    InternalTypeReferenceDefinitions,
} from "../type-reference/InternalTypeReferenceDefinitions";
import { renderTypeShorthand } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectProperty {
    export interface Props {
        property: ResolvedObjectProperty;
        anchorIdParts: string[];
        route: string;
        applyErrorStyles: boolean;
        defaultExpandAll?: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({
    anchorIdParts,
    route,
    property,
    applyErrorStyles,
    defaultExpandAll,
    types,
}) => {
    const anchorId = getAnchorId(anchorIdParts);

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
            data-route={anchorRoute.toLowerCase()}
            className={classNames("flex relative flex-col py-3 scroll-mt-header-height-padded gap-2", {
                "px-3": !contextValue.isRootTypeDefinition,
            })}
        >
            <div className="flex items-baseline gap-2">
                <div className="group/anchor-container relative flex items-center">
                    <AbsolutelyPositionedAnchor href={anchorRoute} smallGap />
                    <div onMouseEnter={onMouseEnterPropertyName} onMouseOut={onMouseOutPropertyName}>
                        <MonospaceText className="text-text-default-light dark:text-text-default-dark text-sm">
                            {property.key}
                        </MonospaceText>
                    </div>
                </div>
                <div className="t-muted text-xs">{renderTypeShorthand(property.valueShape, undefined, types)}</div>
                {property.availability != null && (
                    <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                )}
            </div>
            {property.description && (
                <ApiPageDescription isMarkdown={true} description={property.description} className="text-sm" />
            )}
            {hasInternalTypeReference(property.valueShape, types) && (
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
            )}
        </div>
    );
};
