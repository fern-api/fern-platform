import { APIV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { titleCase } from "@fern-api/ui-core-utils";
import cn from "clsx";
import { useCallback, useMemo } from "react";
import { Markdown } from "../../../mdx/Markdown";
import {
    ResolvedDiscriminatedUnionShapeVariant,
    ResolvedTypeDefinition,
    dereferenceObjectProperties,
} from "../../../resolver/types";
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
        slug: FernNavigation.Slug;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const DiscriminatedUnionVariant: React.FC<DiscriminatedUnionVariant.Props> = ({
    discriminant,
    unionVariant,
    anchorIdParts,
    slug,
    types,
}) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    const shape = useMemo((): ResolvedTypeDefinition => {
        return {
            type: "object",
            properties: [
                {
                    key: APIV1Read.PropertyKey(discriminant),
                    valueShape: {
                        type: "literal",
                        value: {
                            type: "stringLiteral",
                            value: unionVariant.discriminantValue,
                        },
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
                    requiredStringValue: unionVariant.discriminantValue,
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
            <span className="fern-api-property-key">
                {unionVariant.displayName ?? titleCase(unionVariant.discriminantValue)}
            </span>
            {unionVariant.availability != null && (
                <EndpointAvailabilityTag availability={unionVariant.availability} minimal={true} />
            )}
            <div className="flex flex-col">
                <Markdown mdx={unionVariant.description} size="sm" />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeDefinition
                        typeShape={shape}
                        isCollapsible={true}
                        anchorIdParts={anchorIdParts}
                        slug={slug}
                        types={types}
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
