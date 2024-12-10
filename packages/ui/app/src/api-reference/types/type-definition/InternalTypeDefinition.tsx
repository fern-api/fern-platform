import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { FernTooltipProvider } from "@fern-ui/components";
import { useBooleanState, useIsHovering } from "@fern-ui/react-commons";
import cn from "clsx";
import { memo, useCallback, useMemo } from "react";
import { useRouteListener } from "../../../atoms";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { useAnchorId, useSlug } from "../../endpoints/AnchorIdParts";
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
        types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
    }
}

export const InternalTypeDefinition = memo<InternalTypeDefinition.Props>(function InternalTypeDefinition({
    shape,
    isCollapsible,
    types,
}) {
    const slug = useSlug();
    const anchorId = useAnchorId();
    const collapsableContent = useMemo(() => createCollapsibleContent(shape, types), [shape, types]);

    const { value: isCollapsed, toggleValue: toggleIsCollapsed, setValue: setCollapsed } = useBooleanState(true);

    useRouteListener(slug, (anchor) => {
        const isActive = anchor?.startsWith(anchorId + ".") ?? false;
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

    return (
        <FernErrorBoundary component="InternalTypeDefinition">
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
        </FernErrorBoundary>
    );
});
