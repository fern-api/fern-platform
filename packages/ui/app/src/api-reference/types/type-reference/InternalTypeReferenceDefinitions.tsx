import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { Plus } from "iconoir-react";
import React, { ReactElement } from "react";
import { Markdown } from "../../../mdx/Markdown";
import { ResolvedTypeDefinition, ResolvedTypeShape, unwrapReference } from "../../../resolver/types";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";
import { InternalTypeDefinitionError } from "../type-definition/InternalTypeDefinitionError";
import { ListTypeContextProvider } from "./ListTypeContextProvider";
import { MapTypeContextProvider } from "./MapTypeContextProvider";

export declare namespace InternalTypeReferenceDefinitions {
    export interface Props {
        shape: ResolvedTypeShape;
        applyErrorStyles: boolean;
        isCollapsible: boolean;
        className?: string;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<string, ResolvedTypeDefinition>;
        isResponse?: boolean;
    }
}

// HACHACK: this is a hack to render inlined enums above the description
export function hasInlineEnum(shape: ResolvedTypeShape, types: Record<string, ResolvedTypeDefinition>): boolean {
    return visitDiscriminatedUnion(shape, "type")._visit<boolean>({
        object: () => false,
        enum: (value) => value.values.length < 6,
        undiscriminatedUnion: () => false,
        discriminatedUnion: () => false,
        list: (value) => hasInlineEnum(value.shape, types),
        set: (value) => hasInlineEnum(value.shape, types),
        optional: (optional) => hasInlineEnum(optional.shape, types),
        map: (map) => hasInlineEnum(map.keyShape, types) || hasInlineEnum(map.valueShape, types),
        primitive: () => false,
        literal: () => true,
        unknown: () => false,
        _other: () => false,
        reference: (reference) => {
            return hasInlineEnum(
                types[reference.typeId] ?? {
                    type: "unknown",
                    description: undefined,
                    availability: undefined,
                },
                types,
            );
        },
        alias: (alias) => hasInlineEnum(alias.shape, types),
    });
}

export function hasInternalTypeReference(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): boolean {
    return visitDiscriminatedUnion(shape, "type")._visit<boolean>({
        object: () => true,
        enum: () => true,
        undiscriminatedUnion: () => true,
        discriminatedUnion: () => true,
        list: () => true,
        set: () => true,
        optional: (optional) => hasInternalTypeReference(optional.shape, types),
        map: (map) => hasInternalTypeReference(map.keyShape, types) || hasInternalTypeReference(map.valueShape, types),
        primitive: () => false,
        literal: () => true,
        unknown: () => false,
        _other: () => false,
        reference: (reference) =>
            hasInternalTypeReference(
                types[reference.typeId] ?? {
                    type: "unknown",
                    description: undefined,
                    availability: undefined,
                },
                types,
            ),
        alias: (alias) => hasInternalTypeReference(alias.shape, types),
    });
}

export const InternalTypeReferenceDefinitions: React.FC<InternalTypeReferenceDefinitions.Props> = ({
    shape,
    applyErrorStyles,
    isCollapsible,
    className,
    anchorIdParts,
    slug,
    types,
}) => {
    const InternalShapeRenderer = applyErrorStyles ? InternalTypeDefinitionError : InternalTypeDefinition;
    return visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit<ReactElement | null>({
        object: (object) => (
            <div>
                <InternalShapeRenderer
                    typeShape={object}
                    isCollapsible={isCollapsible}
                    anchorIdParts={anchorIdParts}
                    slug={slug}
                    types={types}
                />
                {object.extraProperties != null && (
                    <div className="flex pt-2">
                        <Plus />
                        <Markdown mdx="Optional Additional Properties" className="!t-muted" size="sm" />
                    </div>
                )}
            </div>
        ),
        enum: (enum_) => (
            <InternalShapeRenderer
                typeShape={enum_}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <InternalShapeRenderer
                typeShape={undiscriminatedUnion}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <InternalShapeRenderer
                typeShape={discriminatedUnion}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),

        list: (list) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    shape={list.shape}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    slug={slug}
                    types={types}
                />
            </ListTypeContextProvider>
        ),
        set: (set) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    shape={set.shape}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    slug={slug}
                    types={types}
                />
            </ListTypeContextProvider>
        ),
        optional: (optional) => (
            <InternalTypeReferenceDefinitions
                shape={optional.shape}
                isCollapsible={isCollapsible}
                applyErrorStyles={applyErrorStyles}
                className={className}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
        map: (map) => (
            <MapTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    shape={map.keyShape}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    slug={slug}
                    types={types}
                />
                <InternalTypeReferenceDefinitions
                    shape={map.valueShape}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    slug={slug}
                    types={types}
                />
            </MapTypeContextProvider>
        ),
        primitive: () => null,
        literal: (literal) => (
            <InternalShapeRenderer
                typeShape={literal}
                isCollapsible={false}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
        unknown: () => null,
        _other: () => null,
        alias: (alias) => (
            <InternalTypeReferenceDefinitions
                shape={alias.shape}
                isCollapsible={isCollapsible}
                applyErrorStyles={applyErrorStyles}
                className={className}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
    });
};
