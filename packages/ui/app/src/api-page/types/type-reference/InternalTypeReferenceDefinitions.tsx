import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import React, { ReactElement } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";
import { InternalTypeDefinitionError } from "../type-definition/InternalTypeDefinitionError";
import { ListTypeContextProvider } from "./ListTypeContextProvider";
import { MapTypeContextProvider } from "./MapTypeContextProvider";

export declare namespace InternalTypeReferenceDefinitions {
    export interface Props {
        type: APIV1Read.TypeReference;
        applyErrorStyles: boolean;
        isCollapsible: boolean;
        className?: string;
        anchorIdParts: string[];
        route: string;
    }
}

export const InternalTypeReferenceDefinitions: React.FC<InternalTypeReferenceDefinitions.Props> = ({
    type,
    applyErrorStyles,
    isCollapsible,
    className,
    anchorIdParts,
    route,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    return visitDiscriminatedUnion(type, "type")._visit<ReactElement | null>({
        id: ({ value: typeId }) => {
            const typeShape = resolveTypeById(typeId).shape;
            if (typeShape.type === "alias") {
                return (
                    <InternalTypeReferenceDefinitions
                        type={typeShape.value}
                        isCollapsible={isCollapsible}
                        applyErrorStyles={applyErrorStyles}
                        className={className}
                        anchorIdParts={anchorIdParts}
                        route={route}
                    />
                );
            }
            return applyErrorStyles ? (
                <InternalTypeDefinitionError
                    key={typeId}
                    typeShape={typeShape}
                    isCollapsible={isCollapsible}
                    anchorIdParts={anchorIdParts}
                    route={route}
                />
            ) : (
                <InternalTypeDefinition
                    key={typeId}
                    typeShape={typeShape}
                    isCollapsible={isCollapsible}
                    anchorIdParts={anchorIdParts}
                    route={route}
                />
            );
        },
        primitive: () => null,
        list: ({ itemType }) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={itemType}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    route={route}
                />
            </ListTypeContextProvider>
        ),
        set: ({ itemType }) => (
            <ListTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={itemType}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    route={route}
                />
            </ListTypeContextProvider>
        ),
        optional: ({ itemType }) => (
            <InternalTypeReferenceDefinitions
                type={itemType}
                isCollapsible={isCollapsible}
                applyErrorStyles={applyErrorStyles}
                className={className}
                anchorIdParts={anchorIdParts}
                route={route}
            />
        ),
        map: ({ keyType, valueType }) => (
            <MapTypeContextProvider>
                <InternalTypeReferenceDefinitions
                    type={keyType}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    route={route}
                />
                <InternalTypeReferenceDefinitions
                    type={valueType}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    route={route}
                />
            </MapTypeContextProvider>
        ),
        literal: () => null,
        unknown: () => null,
        _other: () => null,
    });
};
