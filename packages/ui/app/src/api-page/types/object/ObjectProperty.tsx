import { APIV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useAtom } from "jotai";
import { useCallback, useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { AbsolutelyPositionedAnchor } from "../../../commons/AbsolutelyPositionedAnchor";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import {
    finchHideUnsupportedAtom,
    finchProviderAccessTypeAtom,
    finchProviderIdAtom,
    FinchProviderMatrix,
} from "../../../mdx/components/FinchProviderMatrix";
import { getAnchorId } from "../../../util/anchor";
import { ApiPageDescription } from "../../ApiPageDescription";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
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
        property: APIV1Read.ObjectProperty;
        anchorIdParts: string[];
        route: string;
        applyErrorStyles: boolean;
        finchProperties?: FinchProviderMatrix.Property[];
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({
    anchorIdParts,
    route,
    property,
    applyErrorStyles,
    finchProperties,
}) => {
    const [finchProviderId] = useAtom(finchProviderIdAtom);
    const [finchProviderAccessType] = useAtom(finchProviderAccessTypeAtom);
    const [finchHideUnsupported] = useAtom(finchHideUnsupportedAtom);
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

    const anchorRoute = `${route}#${anchorId}`;

    const finchProperty = finchProperties?.find((p) => p.key === property.key);

    let supported: boolean | undefined = undefined;
    if (finchProperty != null && finchProviderId != null && finchProviderAccessType != null) {
        supported = false;
        if (finchProperty.integrations?.[finchProviderId]?.includes(finchProviderAccessType)) {
            supported = true;
        }
    }

    const childProperties = useMemo(() => {
        return finchProperties
            ?.filter((p) => p.key.startsWith(`${property.key}.`) || p.key.startsWith(`${property.key}[].`))
            .map((p) => ({ ...p, key: p.key.replace(`${property.key}.`, "").replace(`${property.key}[].`, "") }));
    }, [finchProperties, property.key]);

    supported =
        supported ??
        (finchProviderId != null &&
        finchProviderAccessType != null &&
        childProperties != null &&
        childProperties.length > 0
            ? childProperties.some((p) => {
                  return p.integrations?.[finchProviderId]?.includes(finchProviderAccessType);
              })
            : undefined);

    if (finchHideUnsupported && supported === false) {
        return null;
    }
    return (
        <div
            data-route={anchorRoute}
            className={classNames("relative py-3 scroll-mt-16", {
                "px-3": !contextValue.isRootTypeDefinition,
            })}
        >
            <div className="float-right text-xs">
                {supported == null ? null : supported ? (
                    <span className="text-accent-primary">Supported</span>
                ) : (
                    <span className="text-black/40">Not supported</span>
                )}
            </div>
            <div className="flex items-baseline gap-2">
                <div className="group/anchor-container relative">
                    <AbsolutelyPositionedAnchor verticalPosition="center" href={anchorRoute} />
                    <div onMouseEnter={onMouseEnterPropertyName} onMouseOut={onMouseOutPropertyName} className="flex">
                        <MonospaceText
                            className={classNames("text-text-primary-light dark:text-text-primary-dark", {
                                "line-through": supported === false,
                            })}
                        >
                            {property.key}
                        </MonospaceText>
                    </div>
                </div>
                <div className="t-muted text-xs">
                    <TypeShorthand type={property.valueType} plural={false} />
                </div>
                {property.availability != null && (
                    <EndpointAvailabilityTag availability={property.availability} minimal={true} />
                )}
            </div>
            <div className="flex flex-col">
                <ApiPageDescription className="mt-3" isMarkdown={true} description={descriptionInfo?.description} />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeReferenceDefinitions
                        type={property.valueType}
                        isCollapsible
                        applyErrorStyles={applyErrorStyles}
                        anchorIdParts={anchorIdParts}
                        route={route}
                        finchProperties={childProperties}
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
