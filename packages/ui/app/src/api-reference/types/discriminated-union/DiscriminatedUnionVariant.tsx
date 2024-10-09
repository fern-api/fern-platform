import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import titleCase from "@fern-api/ui-core-utils/titleCase";
import cn from "clsx";
import { compact } from "lodash-es";
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
        discriminant: ApiDefinition.PropertyKey;
        unionVariant: ApiDefinition.DiscriminatedUnionVariant;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<string, ApiDefinition.TypeDefinition>;
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

    // TODO: render descriptions
    const [shape, descriptions] = useMemo((): [ApiDefinition.TypeShape.Object_, FernDocs.MarkdownText[]] => {
        const unwrapped = ApiDefinition.unwrapDiscriminatedUnionVariant({ discriminant }, unionVariant, types);
        return [
            {
                type: "object",
                properties: unwrapped.properties,
                extends: [],
                extraProperties: undefined,
            },
            unwrapped.descriptions,
        ];
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
                <Markdown mdx={compact([unionVariant.description, ...descriptions])} size="sm" />
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
