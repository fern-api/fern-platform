import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { titleCase } from "@fern-ui/core-utils";
import cn from "clsx";
import { useCallback, useMemo } from "react";
import { Markdown } from "../../../mdx/Markdown";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";

export declare namespace DiscriminatedUnionVariant {
    export interface Props {
        union: ApiDefinition.DiscriminatedUnionType;
        variant: ApiDefinition.DiscriminatedUnionVariant;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<string, ApiDefinition.TypeDefinition>;
    }
}

export const DiscriminatedUnionVariant: React.FC<DiscriminatedUnionVariant.Props> = ({
    union,
    variant,
    anchorIdParts,
    slug,
    types,
}) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    const shape = useMemo((): ApiDefinition.TypeShape.Object_ => {
        return {
            type: "object",
            properties: ApiDefinition.dereferenceDiscriminatedUnionVariant(union, variant, types),
            extends: [],
        };
    }, [types, union, variant]);

    const contextValue = useTypeDefinitionContext();
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath: [
                ...contextValue.jsonPropertyPath,
                {
                    type: "objectFilter",
                    propertyName: union.discriminant,
                    requiredStringValue: variant.discriminantValue,
                },
            ],
        }),
        [contextValue, union.discriminant, variant.discriminantValue],
    );

    return (
        <div
            className={cn("flex flex-col py-3 gap-2", {
                "px-3": !isRootTypeDefinition,
            })}
        >
            <span className="fern-api-property-key">{variant.displayName ?? titleCase(variant.discriminantValue)}</span>
            {variant.availability != null && (
                <EndpointAvailabilityTag availability={variant.availability} minimal={true} />
            )}
            <div className="flex flex-col">
                <Markdown mdx={variant.description} size="sm" />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeDefinition
                        shape={shape}
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
