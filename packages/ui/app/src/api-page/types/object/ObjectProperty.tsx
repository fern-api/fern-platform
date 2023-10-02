import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { AbsolutelyPositionedAnchor } from "../../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { getAnchorId } from "../../../util/anchor";
import { ApiPageDescription } from "../../ApiPageDescription";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeReferenceDefinitions } from "../type-reference/InternalTypeReferenceDefinitions";
import { TypeShorthand } from "../type-shorthand/TypeShorthand";

interface DescriptionInfo {
    description: string;
    isMarkdown: boolean;
}

export declare namespace ObjectProperty {
    export interface Props {
        property: FernRegistryApiRead.ObjectProperty;
        anchorIdParts: string[];
        applyErrorStyles: boolean;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({ anchorIdParts, property, applyErrorStyles }) => {
    const anchorId = getAnchorId(anchorIdParts);
    const { resolveTypeById } = useApiDefinitionContext();

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

    const descriptionInfo = useMemo<DescriptionInfo | undefined>(() => {
        if (property.description != null) {
            return {
                description: property.description,
                isMarkdown: Boolean(property.descriptionContainsMarkdown),
            };
        }
        if (property.valueType.type === "id") {
            const typeDef = resolveTypeById(property.valueType.value);
            if (typeDef.description == null) {
                return undefined;
            }
            return {
                description: typeDef.description,
                isMarkdown: Boolean(typeDef.descriptionContainsMarkdown),
            };
        }
        return undefined;
    }, [property.description, property.descriptionContainsMarkdown, property.valueType, resolveTypeById]);

    return (
        <div
            data-anchor={anchorId}
            className={classNames("flex relative flex-col py-3 scroll-mt-16", {
                "px-3": !contextValue.isRootTypeDefinition,
            })}
        >
            <div className="flex items-baseline gap-2">
                <div className="group/anchor-container relative">
                    <AbsolutelyPositionedAnchor verticalPosition="center" anchor={anchorId} />
                    <div onMouseEnter={onMouseEnterPropertyName} onMouseOut={onMouseOutPropertyName}>
                        <MonospaceText className="text-text-primary-light dark:text-text-primary-dark">
                            {property.key}
                        </MonospaceText>
                    </div>
                </div>
                <div className="t-muted text-xs">
                    <TypeShorthand type={property.valueType} plural={false} />
                </div>
            </div>
            <div className="flex flex-col">
                <ApiPageDescription className="mt-3" isMarkdown={true} description={descriptionInfo?.description} />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeReferenceDefinitions
                        type={property.valueType}
                        isCollapsible
                        applyErrorStyles={applyErrorStyles}
                        anchorIdParts={anchorIdParts}
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
