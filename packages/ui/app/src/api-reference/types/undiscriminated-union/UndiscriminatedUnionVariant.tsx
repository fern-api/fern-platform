import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import cn from "clsx";
import { ReactElement, useCallback } from "react";
import { Markdown } from "../../../mdx/Markdown";
import {
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    ResolvedUndiscriminatedUnionShapeVariant,
    unwrapReference,
} from "../../../resolver/types";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeReferenceDefinitions } from "../type-reference/InternalTypeReferenceDefinitions";
import { renderDeprecatedTypeShorthand } from "../type-shorthand/TypeShorthand";

type IconInfo = {
    content: string;
    size: number;
};

function getIconInfoForTypeReference(
    typeRef: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): IconInfo | null {
    return visitDiscriminatedUnion(unwrapReference(typeRef, types), "type")._visit<IconInfo | null>({
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit<IconInfo | null>({
                string: () => ({ content: "abc", size: 6 }),
                boolean: () => ({ content: "true", size: 6 }),
                integer: () => ({ content: "123", size: 6 }),
                uint: () => ({ content: "123", size: 6 }),
                uint64: () => ({ content: "123", size: 6 }),
                double: () => ({ content: "1.2", size: 6 }),
                long: () => ({ content: "123", size: 6 }),
                datetime: () => ({ content: "abc", size: 6 }),
                uuid: () => ({ content: "abc", size: 6 }),
                base64: () => ({ content: "abc", size: 6 }),
                date: () => ({ content: "abc", size: 6 }),
                bigInteger: () => ({ content: "123", size: 6 }),
                _other: () => null,
            }),
        literal: () => ({ content: "!", size: 6 }),
        object: () => null,
        undiscriminatedUnion: () => null,
        discriminatedUnion: () => null,
        enum: () => null,
        optional: (optional) => getIconInfoForTypeReference(optional.shape, types),
        list: (list) => getIconInfoForTypeReference(list.shape, types),
        set: (set) => getIconInfoForTypeReference(set.shape, types),
        map: () => ({ content: "{}", size: 9 }),
        unknown: () => ({ content: "{}", size: 6 }),
        _other: () => null,
        alias: (reference) => getIconInfoForTypeReference(reference.shape, types),
    });
}

function getIconForTypeReference(
    typeRef: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): ReactElement | null {
    const info = getIconInfoForTypeReference(typeRef, types);
    if (info == null) {
        return null;
    }
    const { content, size } = info;
    return (
        <div
            className="border-default flex size-6 items-center justify-center rounded border"
            style={{ fontSize: size }}
        >
            {content}
        </div>
    );
}

export declare namespace UndiscriminatedUnionVariant {
    export interface Props {
        unionVariant: ResolvedUndiscriminatedUnionShapeVariant;
        anchorIdParts: readonly string[];
        applyErrorStyles: boolean;
        slug: FernNavigation.Slug;
        idx: number;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const UndiscriminatedUnionVariant: React.FC<UndiscriminatedUnionVariant.Props> = ({
    unionVariant,
    anchorIdParts,
    applyErrorStyles,
    slug,
    types,
}) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();
    const contextValue = useTypeDefinitionContext();
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath: [...contextValue.jsonPropertyPath],
        }),
        [contextValue],
    );

    return (
        <div
            className={cn("flex flex-col py-3", {
                "px-3": !isRootTypeDefinition,
            })}
        >
            <div className="flex flex-col gap-2">
                <div className="t-muted flex items-center gap-2">
                    {getIconForTypeReference(unionVariant.shape, types)}
                    {unionVariant.displayName == null ? null : (
                        <span className="t-default font-mono text-sm">{unionVariant.displayName}</span>
                    )}
                    <span className="t-muted inline-flex items-baseline gap-2 text-xs">
                        {renderDeprecatedTypeShorthand(
                            unionVariant.shape,
                            { nullable: contextValue.isResponse },
                            types,
                        )}
                    </span>
                    {unionVariant.availability != null && (
                        <EndpointAvailabilityTag availability={unionVariant.availability} minimal={true} />
                    )}
                </div>
                <Markdown mdx={unionVariant.description} size="sm" />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeReferenceDefinitions
                        shape={unionVariant.shape}
                        anchorIdParts={anchorIdParts}
                        isCollapsible
                        applyErrorStyles={applyErrorStyles}
                        slug={slug}
                        types={types}
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
