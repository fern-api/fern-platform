import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState, useIsHovering } from "@fern-ui/react-commons";
import React, { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useRouteListener } from "../../../atoms";
import { ResolvedTypeDefinition, dereferenceObjectProperties } from "../../../resolver/types";
import { getAnchorId } from "../../../util/anchor";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { DiscriminatedUnionVariant } from "../discriminated-union/DiscriminatedUnionVariant";
import { EnumValue } from "../enum/EnumValue";
import { ObjectProperty } from "../object/ObjectProperty";
import { UndiscriminatedUnionVariant } from "../undiscriminated-union/UndiscriminatedUnionVariant";
import { FernCollapseWithButton } from "./FernCollapseWithButton";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";

export declare namespace InternalTypeDefinitionError {
    export interface Props {
        typeShape: ResolvedTypeDefinition;
        isCollapsible: boolean;
        anchorIdParts: readonly string[];
        route: string;
        defaultExpandAll?: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

interface CollapsibleContent {
    elements: ReactElement[];
    elementNameSingular: string;
    elementNamePlural: string;
    separatorText?: string;
}

export const InternalTypeDefinitionError: React.FC<InternalTypeDefinitionError.Props> = ({
    typeShape,
    isCollapsible,
    anchorIdParts,
    route,
    defaultExpandAll = false,
    types,
}) => {
    const collapsableContent = useMemo(
        () =>
            visitDiscriminatedUnion(typeShape, "type")._visit<CollapsibleContent | undefined>({
                object: (object) => ({
                    elements: dereferenceObjectProperties(object, types).map((property) => (
                        <ObjectProperty
                            key={property.key}
                            property={property}
                            anchorIdParts={[...anchorIdParts, property.key]}
                            route={route}
                            applyErrorStyles
                            types={types}
                        />
                    )),
                    elementNameSingular: "property",
                    elementNamePlural: "properties",
                }),
                undiscriminatedUnion: (union) => ({
                    elements: union.variants.map((variant, variantIdx) => (
                        <UndiscriminatedUnionVariant
                            key={variantIdx}
                            unionVariant={variant}
                            anchorIdParts={anchorIdParts}
                            applyErrorStyles={false}
                            route={route}
                            idx={variantIdx}
                            types={types}
                        />
                    )),
                    elementNameSingular: "variant",
                    elementNamePlural: "variants",
                    separatorText: "OR",
                }),
                discriminatedUnion: (union) => ({
                    elements: union.variants.map((variant) => (
                        <DiscriminatedUnionVariant
                            key={variant.discriminantValue}
                            discriminant={union.discriminant}
                            unionVariant={variant}
                            anchorIdParts={anchorIdParts}
                            route={route}
                            types={types}
                        />
                    )),
                    elementNameSingular: "variant",
                    elementNamePlural: "variants",
                    separatorText: "OR",
                }),
                enum: (enum_) => ({
                    elements: enum_.values.map((enumValue) => (
                        <EnumValue key={enumValue.value} enumValue={enumValue} />
                    )),
                    elementNameSingular: "enum value",
                    elementNamePlural: "enum values",
                }),
                _other: () => undefined,
                alias: () => undefined,
                unknown: () => undefined,
            }),
        [typeShape, types, anchorIdParts, route],
    );

    const anchorIdSoFar = getAnchorId(anchorIdParts);
    const {
        value: isCollapsed,
        toggleValue: toggleIsCollapsed,
        setValue: setCollapsed,
    } = useBooleanState(!defaultExpandAll);

    useEffect(() => {
        setCollapsed(!defaultExpandAll);
    }, [defaultExpandAll, setCollapsed]);

    useEffect(() => {
        setCollapsed(!defaultExpandAll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useRouteListener(route, (anchor) => {
        const isActive = anchor?.startsWith(anchorIdSoFar + ".") ?? false;
        if (isActive) {
            setCollapsed(false);
        }
    });

    const { isHovering, ...containerCallbacks } = useIsHovering();

    const contextValue = useTypeDefinitionContext();
    const collapsibleContentContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            isRootTypeDefinition: false,
        }),
        [contextValue],
    );

    if (collapsableContent == null || collapsableContent.elements.length === 0) {
        return null;
    }

    if (!isCollapsible) {
        return (
            <TypeDefinitionDetails
                elements={collapsableContent.elements}
                separatorText={collapsableContent.separatorText}
            />
        );
    }

    const showText =
        collapsableContent.elements.length === 1
            ? `Show ${collapsableContent.elementNameSingular}`
            : `Show ${collapsableContent.elements.length} ${collapsableContent.elementNamePlural}`;
    const hideText =
        collapsableContent.elements.length === 1
            ? `Hide ${collapsableContent.elementNameSingular}`
            : `Hide ${collapsableContent.elements.length} ${collapsableContent.elementNamePlural}`;

    return (
        <FernCollapseWithButton
            isOpen={!isCollapsed}
            toggleIsOpen={toggleIsCollapsed}
            showText={showText}
            hideText={hideText}
            buttonProps={containerCallbacks}
        >
            <TypeDefinitionContext.Provider value={collapsibleContentContextValue}>
                <TypeDefinitionDetails
                    elements={collapsableContent.elements}
                    separatorText={collapsableContent.separatorText}
                />
            </TypeDefinitionContext.Provider>
        </FernCollapseWithButton>
    );
};
