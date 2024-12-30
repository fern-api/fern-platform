import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltipProvider } from "@fern-ui/components";
import { useBooleanState, useIsHovering } from "@fern-ui/react-commons";
import cn from "clsx";
import { memo, useCallback, useMemo } from "react";
import { useRouteListener } from "../../../atoms";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { getAnchorId } from "../../../util/anchor";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { EnumTypeDefinition } from "./EnumTypeDefinition";
import { FernCollapseWithButton } from "./FernCollapseWithButton";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";
import { createCollapsibleContent } from "./createCollapsibleContent";

export declare namespace InternalTypeDefinition {
    export interface Props {
        shape: ApiDefinition.TypeShapeOrReference;
        isCollapsible: boolean;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
    }
}

export const InternalTypeDefinition = memo<InternalTypeDefinition.Props>(function InternalTypeDefinition({
    shape,
    isCollapsible,
    anchorIdParts,
    slug,
    types,
}) {
    const collapsableContent = useMemo(
        () => createCollapsibleContent(shape, types, anchorIdParts, slug),
        [shape, types, anchorIdParts, slug],
    );

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
        // if (collapsableContent.elementNameSingular === "literal") {
        //     return null;
        // }
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
