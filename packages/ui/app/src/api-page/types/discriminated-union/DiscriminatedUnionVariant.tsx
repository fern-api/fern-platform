import { APIV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { startCase } from "lodash-es";
import { useCallback, useMemo } from "react";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { ApiPageDescription } from "../../ApiPageDescription";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";

export declare namespace DiscriminatedUnionVariant {
    export interface Props {
        discriminant: string;
        unionVariant: APIV1Read.DiscriminatedUnionVariant;
        anchorIdParts: string[];
        route: string;
        defaultExpandAll?: boolean;
    }
}

export const DiscriminatedUnionVariant: React.FC<DiscriminatedUnionVariant.Props> = ({
    discriminant,
    unionVariant,
    anchorIdParts,
    route,
    defaultExpandAll = false,
}) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    const shape = useMemo((): APIV1Read.TypeShape => {
        return {
            ...unionVariant.additionalProperties,
            type: "object",
            properties: [
                {
                    key: discriminant,
                    valueType: {
                        type: "literal",
                        value: {
                            type: "stringLiteral",
                            value: unionVariant.discriminantValue,
                        },
                    },
                },
                ...unionVariant.additionalProperties.properties,
            ],
        };
    }, [discriminant, unionVariant.additionalProperties, unionVariant.discriminantValue]);

    const contextValue = useTypeDefinitionContext();
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath: [
                ...contextValue.jsonPropertyPath,
                {
                    type: "objectFilter",
                    propertyName: discriminant,
                    requiredValue: unionVariant.discriminantValue,
                },
            ],
        }),
        [contextValue, discriminant, unionVariant.discriminantValue]
    );

    return (
        <div
            className={classNames("flex flex-col py-3", {
                "px-3": !isRootTypeDefinition,
            })}
        >
            <MonospaceText className="text-text-primary-light dark:text-text-primary-dark text-sm">
                {startCase(unionVariant.discriminantValue)}
            </MonospaceText>
            {unionVariant.availability != null && (
                <EndpointAvailabilityTag availability={unionVariant.availability} minimal={true} />
            )}
            <div className="flex flex-col">
                <ApiPageDescription description={unionVariant.description} isMarkdown={true} />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeDefinition
                        typeShape={shape}
                        isCollapsible={true}
                        anchorIdParts={anchorIdParts}
                        route={route}
                        defaultExpandAll={defaultExpandAll}
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
