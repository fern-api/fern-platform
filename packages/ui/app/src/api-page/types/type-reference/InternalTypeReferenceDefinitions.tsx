import { ResolvedTypeReference } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import React, { ReactElement } from "react";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";
import { InternalTypeDefinitionError } from "../type-definition/InternalTypeDefinitionError";
import { ListTypeContextProvider } from "./ListTypeContextProvider";
import { MapTypeContextProvider } from "./MapTypeContextProvider";

export declare namespace InternalTypeReferenceDefinitions {
    export interface Props {
        shape: ResolvedTypeReference;
        applyErrorStyles: boolean;
        isCollapsible: boolean;
        className?: string;
        anchorIdParts: string[];
        route: string;
        defaultExpandAll?: boolean;
    }
}

export const InternalTypeReferenceDefinitions: React.FC<InternalTypeReferenceDefinitions.Props> = ({
    shape,
    applyErrorStyles,
    isCollapsible,
    className,
    anchorIdParts,
    route,
    defaultExpandAll = false,
}) => {
    const InternalShapeRenderer = applyErrorStyles ? InternalTypeDefinitionError : InternalTypeDefinition;
    return visitDiscriminatedUnion(shape, "type")._visit<ReactElement | null>({
        object: (object) => (
            <InternalShapeRenderer
                typeShape={object}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                route={route}
                defaultExpandAll={defaultExpandAll}
            />
        ),
        enum: (enum_) => (
            <InternalShapeRenderer
                typeShape={enum_}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                route={route}
                defaultExpandAll={defaultExpandAll}
            />
        ),
        undiscriminatedUnion: (undiscriminatedUnion) => (
            <InternalShapeRenderer
                typeShape={undiscriminatedUnion}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                route={route}
                defaultExpandAll={defaultExpandAll}
            />
        ),
        discriminatedUnion: (discriminatedUnion) => (
            <InternalShapeRenderer
                typeShape={discriminatedUnion}
                isCollapsible={isCollapsible}
                anchorIdParts={anchorIdParts}
                route={route}
                defaultExpandAll={defaultExpandAll}
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
                    route={route}
                    defaultExpandAll={defaultExpandAll}
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
                    route={route}
                    defaultExpandAll={defaultExpandAll}
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
                route={route}
                defaultExpandAll={defaultExpandAll}
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
                    route={route}
                    defaultExpandAll={defaultExpandAll}
                />
                <InternalTypeReferenceDefinitions
                    shape={map.valueShape}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    route={route}
                    defaultExpandAll={defaultExpandAll}
                />
            </MapTypeContextProvider>
        ),
        string: () => null,
        boolean: () => null,
        integer: () => null,
        double: () => null,
        long: () => null,
        datetime: () => null,
        uuid: () => null,
        base64: () => null,
        date: () => null,
        booleanLiteral: () => null,
        stringLiteral: () => null,
        unknown: () => null,
        _other: () => null,
    });
};
