import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import React from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";
import { ListTypeContextProvider } from "./ListTypeContextProvider";
import { MapTypeContextProvider } from "./MapTypeContextProvider";

export declare namespace InternalTypeReferenceDefinitions {
    export interface Props {
        type: FernRegistryApiRead.TypeReference;
        isCollapsible: boolean;
        className?: string;
        getPropertyAnchor?: (property: FernRegistryApiRead.ObjectProperty) => string;
    }
}

export const InternalTypeReferenceDefinitions: React.FC<InternalTypeReferenceDefinitions.Props> = ({
    type,
    isCollapsible,
    className,
    getPropertyAnchor,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    return visitDiscriminatedUnion(type, "type")._visit<JSX.Element | null>({
        id: ({ value: typeId }) => {
            const typeShape = resolveTypeById(typeId).shape;
            if (typeShape.type === "alias") {
                return (
                    <InternalTypeReferenceDefinitions
                        type={typeShape.value}
                        isCollapsible={isCollapsible}
                        className={className}
                        getPropertyAnchor={getPropertyAnchor}
                    />
                );
            }
            return (
                <InternalTypeDefinition
                    key={typeId}
                    typeShape={typeShape}
                    isCollapsible={isCollapsible}
                    getPropertyAnchor={getPropertyAnchor}
                />
            );
        },
        primitive: () => null,
        list: ({ itemType }) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={itemType}
                    isCollapsible={isCollapsible}
                    className={className}
                    getPropertyAnchor={getPropertyAnchor}
                />
            </ListTypeContextProvider>
        ),
        set: ({ itemType }) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={itemType}
                    isCollapsible={isCollapsible}
                    className={className}
                    getPropertyAnchor={getPropertyAnchor}
                />
            </ListTypeContextProvider>
        ),
        optional: ({ itemType }) => (
            <InternalTypeReferenceDefinitions
                type={itemType}
                isCollapsible={isCollapsible}
                className={className}
                getPropertyAnchor={getPropertyAnchor}
            />
        ),
        map: ({ keyType, valueType }) => (
            <MapTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={keyType}
                    isCollapsible={isCollapsible}
                    className={className}
                    getPropertyAnchor={getPropertyAnchor}
                />
                <InternalTypeReferenceDefinitions
                    type={valueType}
                    isCollapsible={isCollapsible}
                    className={className}
                    getPropertyAnchor={getPropertyAnchor}
                />
            </MapTypeContextProvider>
        ),
        literal: () => null,
        unknown: () => null,
        _other: () => null,
    });
};
