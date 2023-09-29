import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import React from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";
import { InternalTypeDefinitionError } from "../type-definition/InternalTypeDefinitionError";
import { ListTypeContextProvider } from "./ListTypeContextProvider";
import { MapTypeContextProvider } from "./MapTypeContextProvider";

export declare namespace InternalTypeReferenceDefinitions {
    export interface Props {
        type: FernRegistryApiRead.TypeReference;
        isError: boolean;
        isCollapsible: boolean;
        className?: string;
        anchorIdParts: string[];
    }
}

export const InternalTypeReferenceDefinitions: React.FC<InternalTypeReferenceDefinitions.Props> = ({
    type,
    isError,
    isCollapsible,
    className,
    anchorIdParts,
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
                        isError={isError}
                        className={className}
                        anchorIdParts={anchorIdParts}
                    />
                );
            }
            return isError ? (
                <InternalTypeDefinitionError
                    key={typeId}
                    typeShape={typeShape}
                    isCollapsible={isCollapsible}
                    anchorIdParts={anchorIdParts}
                />
            ) : (
                <InternalTypeDefinition
                    key={typeId}
                    typeShape={typeShape}
                    isCollapsible={isCollapsible}
                    anchorIdParts={anchorIdParts}
                />
            );
        },
        primitive: () => null,
        list: ({ itemType }) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={itemType}
                    isCollapsible={isCollapsible}
                    isError={isError}
                    className={className}
                    anchorIdParts={anchorIdParts}
                />
            </ListTypeContextProvider>
        ),
        set: ({ itemType }) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={itemType}
                    isCollapsible={isCollapsible}
                    isError={isError}
                    className={className}
                    anchorIdParts={anchorIdParts}
                />
            </ListTypeContextProvider>
        ),
        optional: ({ itemType }) => (
            <InternalTypeReferenceDefinitions
                type={itemType}
                isCollapsible={isCollapsible}
                isError={isError}
                className={className}
                anchorIdParts={anchorIdParts}
            />
        ),
        map: ({ keyType, valueType }) => (
            <MapTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={keyType}
                    isCollapsible={isCollapsible}
                    isError={isError}
                    className={className}
                    anchorIdParts={anchorIdParts}
                />
                <InternalTypeReferenceDefinitions
                    type={valueType}
                    isCollapsible={isCollapsible}
                    isError={isError}
                    className={className}
                    anchorIdParts={anchorIdParts}
                />
            </MapTypeContextProvider>
        ),
        literal: () => null,
        unknown: () => null,
        _other: () => null,
    });
};
