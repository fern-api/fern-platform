import cn from "clsx";
import { startCase } from "lodash-es";
import { useCallback, useMemo } from "react";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import {
    ResolvedDiscriminatedUnionShapeVariant,
    ResolvedTypeDefinition,
    dereferenceObjectProperties,
} from "../../../resolver/types";
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
        anchorIdParts: readonly string[];
        route: string;
        defaultExpandAll?: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const DiscriminatedUnionVariant: React.FC<DiscriminatedUnionVariant.Props> = ({
    discriminant,
    unionVariant,
    anchorIdParts,
    route,
    defaultExpandAll = false,
    types,
}) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    const shape = useMemo((): ResolvedTypeDefinition => {
        return {
            type: "object",
            properties: [
                {
                    key: discriminant,
                    valueShape: {
                        type: "stringLiteral",
                        value: unionVariant.discriminantValue,
                        description: undefined,
                        availability: undefined,
                    },
                    description: undefined,
                    availability: undefined,
                    hidden: false,
                },
                ...dereferenceObjectProperties(unionVariant, types),
            ],
            name: undefined,
            description: undefined,
            availability: undefined,
            extends: [],
        };
    }, [discriminant, types, unionVariant]);

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
            className={cn("flex flex-col py-3 gap-2", {
                "px-3": !isRootTypeDefinition,
            })}
        >
            <MonospaceText className="t-default text-sm">{startCase(unionVariant.discriminantValue)}</MonospaceText>
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
                        types={types}
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
