import classNames from "classnames";
import { useRouter } from "next/router";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
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

export const ObjectProperty: React.FC<ObjectProperty.Props> = (props) => {
    const { route, anchorIdParts } = props;
    const router = useRouter();
    const anchorId = getAnchorId(anchorIdParts);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setIsActive(router.asPath.includes(`${route}#${anchorId}`));
    }, [router.asPath, anchorId, route]);

    return <ObjectPropertyInternal anchorId={anchorId} isActive={isActive} {...props} />;
};

interface ObjectPropertyInternalProps extends ObjectProperty.Props {
    anchorId: string;
    isActive: boolean;
}

const ObjectPropertyInternal = memo<ObjectPropertyInternalProps>(function ObjectPropertyInternal({
    route,
    property,
    applyErrorStyles,
    defaultExpandAll,
    types,
    anchorIdParts,
    anchorId,
    isActive,
}) {
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
                "outline-accent-primary outline-1 outline outline-offset-4 rounded-sm": isActive,
            })}
        >
            <div className="flex items-baseline gap-2">
                <div className="group/anchor-container relative flex items-center">
                    <AbsolutelyPositionedAnchor href={anchorRoute} smallGap />
                    <div onMouseEnter={onMouseEnterPropertyName} onMouseOut={onMouseOutPropertyName}>
                        <MonospaceText
                            className={classNames("t-default text-sm", {
                                "t-accent": isActive,
                            })}
                        >
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
});
