import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import React, { ReactElement } from "react";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";
import { InternalTypeDefinitionError } from "../type-definition/InternalTypeDefinitionError";
import { ListTypeContextProvider } from "./ListTypeContextProvider";
import { MapTypeContextProvider } from "./MapTypeContextProvider";

export declare namespace InternalTypeReferenceDefinitions {
    export interface Props {
        applyErrorStyles: boolean;
        isCollapsible: boolean;
        className?: string;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        shape: ApiDefinition.TypeShapeOrReference;
        types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
        isResponse?: boolean;
    }
}

// HACHACK: this is a hack to render inlined enums above the description
export function hasInlineEnum(
    shape: ApiDefinition.TypeShapeOrReference,
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>,
): boolean {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    return visitDiscriminatedUnion(unwrapped.shape)._visit<boolean>({
        object: () => false,
        enum: (value) => value.values.length < 6,
        undiscriminatedUnion: () => false,
        discriminatedUnion: () => false,
        list: (value) => hasInlineEnum(value.itemShape, types),
        set: (value) => hasInlineEnum(value.itemShape, types),
        map: (map) => hasInlineEnum(map.keyShape, types) || hasInlineEnum(map.valueShape, types),
        primitive: () => false,
        literal: () => true,
        unknown: () => false,
        _other: () => false,
    });
}

export function hasInternalTypeReference(
    shape: ApiDefinition.TypeShapeOrReference,
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>,
): boolean {
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    return visitDiscriminatedUnion(unwrapped.shape)._visit<boolean>({
        object: () => true,
        enum: () => true,
        undiscriminatedUnion: () => true,
        discriminatedUnion: () => true,
        list: () => true,
        set: () => true,
        map: (map) => hasInternalTypeReference(map.keyShape, types) || hasInternalTypeReference(map.valueShape, types),
        primitive: () => false,
        literal: () => true,
        unknown: () => false,
        _other: () => false,
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
    const unwrapped = ApiDefinition.unwrapReference(shape, types);
    return visitDiscriminatedUnion(unwrapped.shape)._visit<ReactElement | null>({
        object: (object) => (
            <InternalShapeRenderer
                shape={object}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
        enum: (enum_) => (
            <InternalShapeRenderer
                shape={enum_}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <InternalShapeRenderer
                shape={undiscriminatedUnion}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <InternalShapeRenderer
                shape={discriminatedUnion}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),

        list: (list) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    shape={list.itemShape}
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
                    shape={set.itemShape}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    slug={slug}
                    types={types}
                />
            </ListTypeContextProvider>
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
                shape={literal}
                isCollapsible={false}
                anchorIdParts={anchorIdParts}
                slug={slug}
                types={types}
            />
        ),
        unknown: () => null,
        _other: () => null,
    });
};
