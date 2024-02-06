import { ResolvedDiscriminatedUnionShapeVariant, ResolvedTypeShape } from "@fern-ui/app-utils";
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
        unionVariant: ResolvedDiscriminatedUnionShapeVariant;
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

    const shape = useMemo((): ResolvedTypeShape => {
        return {
            type: "object",
            properties: () => [
                {
                    key: discriminant,
                    valueShape: {
                        type: "stringLiteral",
                        value: unionVariant.discriminantValue,
                    },
                },
                ...unionVariant.additionalProperties,
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
        [contextValue, discriminant, unionVariant.discriminantValue],
    );

    return (
        <div
            className={classNames("flex flex-col py-3 gap-2", {
                "px-3": !isRootTypeDefinition,
            })}
        >
            <MonospaceText className="text-text-default-light dark:text-text-default-dark text-sm">
                {startCase(unionVariant.discriminantValue)}
            </MonospaceText>
            {unionVariant.availability != null && (
                <EndpointAvailabilityTag availability={unionVariant.availability} minimal={true} />
            )}
            <div className="flex flex-col">
                <ApiPageDescription isMarkdown={true} description={unionVariant.description} className="text-sm" />
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
