import { ResolvedObjectProperty } from "@fern-ui/app-utils";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { AbsolutelyPositionedAnchor } from "../../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { getAnchorId } from "../../../util/anchor";
import { ApiPageDescription } from "../../ApiPageDescription";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext
} from "../context/TypeDefinitionContext";
import {
    hasInternalTypeReference,
    InternalTypeReferenceDefinitions
} from "../type-reference/InternalTypeReferenceDefinitions";
import { renderTypeShorthand } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectProperty {
    export interface Props {
        property: ResolvedObjectProperty;
        anchorIdParts: string[];
        route: string;
        applyErrorStyles: boolean;
        defaultExpandAll?: boolean;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({
    anchorIdParts,
    route,
    property,
    applyErrorStyles,
    defaultExpandAll,
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
                <div className="t-muted text-xs">{renderTypeShorthand(property.valueShape)}</div>
                {property.availability != null && (
                    <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                )}
            </div>
            {property.description || hasInternalTypeReference(property.valueShape) ? (
                <div className="flex flex-col">
                    <ApiPageDescription isMarkdown={true} description={property.description} className="text-sm" />
                    <TypeDefinitionContext.Provider value={newContextValue}>
                        <InternalTypeReferenceDefinitions
                            shape={property.valueShape}
                            isCollapsible
                            applyErrorStyles={applyErrorStyles}
                            anchorIdParts={anchorIdParts}
                            route={route}
                            defaultExpandAll={defaultExpandAll}
                        />
                    </TypeDefinitionContext.Provider>
                </div>
            ) : undefined}
        </div>
    );
};
