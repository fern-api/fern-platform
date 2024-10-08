import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltipProvider } from "@fern-ui/components";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState, useIsHovering } from "@fern-ui/react-commons";
import cn from "clsx";
import { ReactElement, memo, useCallback, useMemo } from "react";
import { useRouteListener } from "../../../atoms";
import { Chip } from "../../../components/Chip";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { getAnchorId } from "../../../util/anchor";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { DiscriminatedUnionVariant } from "../discriminated-union/DiscriminatedUnionVariant";
import { ObjectProperty } from "../object/ObjectProperty";
import { UndiscriminatedUnionVariant } from "../undiscriminated-union/UndiscriminatedUnionVariant";
import { EnumTypeDefinition } from "./EnumTypeDefinition";
import { FernCollapseWithButton } from "./FernCollapseWithButton";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";

export declare namespace InternalTypeDefinition {
    export interface Props {
        shape: ApiDefinition.TypeShapeOrReference;
        isCollapsible: boolean;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
    }
}

interface CollapsibleContent {
    elements: ReactElement[];
    elementNameSingular: string;
    elementNamePlural: string;
    separatorText?: string;
}

export const InternalTypeDefinition = memo<InternalTypeDefinition.Props>(function InternalTypeDefinition({
    shape,
    isCollapsible,
    anchorIdParts,
    slug,
    types,
}) {
    const collapsableContent = useMemo(() => {
        const unwrapped = ApiDefinition.unwrapReference(shape, types);
        return visitDiscriminatedUnion(unwrapped.shape)._visit<CollapsibleContent | undefined>({
            object: (object) => {
                const { properties } = ApiDefinition.unwrapObjectType(object, types);
                return {
                    elements: properties.map((property) => (
                        <ObjectProperty
                            key={property.key}
                            property={property}
                            anchorIdParts={[...anchorIdParts, property.key]}
                            slug={slug}
                            applyErrorStyles
                            types={types}
                        />
                    )),
                    elementNameSingular: "property",
                    elementNamePlural: "properties",
                };
            },
            undiscriminatedUnion: (union) => ({
                elements: union.variants.map((variant, variantIdx) => (
                    <UndiscriminatedUnionVariant
                        key={variantIdx}
                        unionVariant={variant}
                        anchorIdParts={[...anchorIdParts, variant.displayName ?? variantIdx.toString()]}
                        applyErrorStyles={false}
                        slug={slug}
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
                        anchorIdParts={[...anchorIdParts, variant.discriminantValue]}
                        slug={slug}
                        types={types}
                    />
                )),
                elementNameSingular: "variant",
                elementNamePlural: "variants",
                separatorText: "OR",
            }),
            enum: (enum_) => ({
                elements: enum_.values.map((enumValue) => (
                    <Chip key={enumValue.value} name={enumValue.value} description={enumValue.description} />
                    // <EnumValue key={enumValue.value} enumValue={enumValue} />
                )),
                elementNameSingular: "enum value",
                elementNamePlural: "enum values",
            }),
            literal: (literal) => ({
                elements: [
                    visitDiscriminatedUnion(literal.value, "type")._visit({
                        stringLiteral: (value) => <Chip key={value.value} name={value.value} />,
                        booleanLiteral: (value) => <Chip key={value.value.toString()} name={value.value.toString()} />,
                        _other: () => <span>{"<unknown>"}</span>,
                    }),
                ],
                elementNameSingular: "literal",
                elementNamePlural: "literals",
            }),
            unknown: () => undefined,
            _other: () => undefined,
            primitive: () => undefined,
            list: () => undefined,
            set: () => undefined,
            map: () => undefined,
        });
    }, [shape, types, anchorIdParts, slug]);

    const anchorIdSoFar = getAnchorId(anchorIdParts);
    const { value: isCollapsed, toggleValue: toggleIsCollapsed, setValue: setCollapsed } = useBooleanState(true);

    useRouteListener(slug, (anchor) => {
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
        // TODO: (rohin) Refactor this
        if (collapsableContent.elementNameSingular === "literal") {
            return null;
        }
        return (
            <FernErrorBoundary component="InternalTypeDefinition">
                <FernTooltipProvider>
                    <TypeDefinitionDetails
                        elements={collapsableContent.elements}
                        separatorText={collapsableContent.separatorText}
                    />
                </FernTooltipProvider>
            </FernErrorBoundary>
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

    const renderContent = () => (
        <div
            className={cn(
                "text-sm internal-type-definition-container",
                collapsableContent.elementNameSingular === "enum value" ? "enum-container" : undefined,
            )}
        >
            {collapsableContent.elementNameSingular !== "enum value" ? (
                collapsableContent.elements.length === 0 ? null : (
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
                )
            ) : (
                <EnumTypeDefinition
                    elements={collapsableContent.elements}
                    isCollapsed={isCollapsed}
                    toggleIsCollapsed={toggleIsCollapsed}
                    collapsibleContentContextValue={collapsibleContentContextValue}
                    showText={showText}
                />
            )}
        </div>
    );

    return (
        <FernErrorBoundary component="InternalTypeDefinition">
            <FernTooltipProvider>{renderContent()}</FernTooltipProvider>
        </FernErrorBoundary>
    );
});
