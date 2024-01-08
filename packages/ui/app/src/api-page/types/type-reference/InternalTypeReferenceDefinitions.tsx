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
        defaultExpandAll?: boolean;
    }
}

export const InternalTypeReferenceDefinitions: React.FC<InternalTypeReferenceDefinitions.Props> = ({
    type,
    applyErrorStyles,
    isCollapsible,
    className,
    anchorIdParts,
    route,
    defaultExpandAll = false,
}) => {
    const { resolveTypeById } = useApiDefinitionContext();

    return visitDiscriminatedUnion(type, "type")._visit<ReactElement | null>({
        id: ({ value: typeId }) => {
            const typeShape = resolveTypeById(typeId)?.shape;
            if (typeShape == null) {
                // eslint-disable-next-line no-console
                console.error("Type does not exist", typeId);
                return null;
            }
            if (typeShape.type === "alias") {
                return (
                    <InternalTypeReferenceDefinitions
                        type={typeShape.value}
                        isCollapsible={isCollapsible}
                        applyErrorStyles={applyErrorStyles}
                        className={className}
                        anchorIdParts={anchorIdParts}
                        route={route}
                        defaultExpandAll={defaultExpandAll}
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
                    defaultExpandAll={defaultExpandAll}
                />
            ) : (
                <InternalTypeDefinition
                    key={typeId}
                    typeShape={typeShape}
                    isCollapsible={isCollapsible}
                    anchorIdParts={anchorIdParts}
                    route={route}
                    defaultExpandAll={defaultExpandAll}
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
                    defaultExpandAll={defaultExpandAll}
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
                    defaultExpandAll={defaultExpandAll}
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
                defaultExpandAll={defaultExpandAll}
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
                    defaultExpandAll={defaultExpandAll}
                />
                <InternalTypeReferenceDefinitions
                    type={valueType}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    route={route}
                    defaultExpandAll={defaultExpandAll}
                />
            </MapTypeContextProvider>
        ),
        literal: () => null,
        unknown: () => null,
        _other: () => null,
    });
};
