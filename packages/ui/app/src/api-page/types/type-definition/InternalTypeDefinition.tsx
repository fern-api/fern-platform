import { Collapse, Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState, useIsHovering } from "@fern-ui/react-commons";
import classNames from "classnames";
import { useRouter } from "next/router";
import React, { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { Chip } from "../../../components/common/Chip";
import { useNavigationContext } from "../../../navigation-context";
import { getAnchorId } from "../../../util/anchor";
import { getAllObjectProperties } from "../../utils/getAllObjectProperties";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { DiscriminatedUnionVariant } from "../discriminated-union/DiscriminatedUnionVariant";
import { ObjectProperty } from "../object/ObjectProperty";
import { UndiscriminatedUnionVariant } from "../undiscriminated-union/UndiscriminatedUnionVariant";
import { EnumTypeDefinition } from "./EnumTypeDefinition";
import styles from "./InternalTypeDefinition.module.scss";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";

export declare namespace InternalTypeDefinition {
    export interface Props {
        typeShape: APIV1Read.TypeShape;
        isCollapsible: boolean;
        anchorIdParts: string[];
        route: string;
        defaultExpandAll?: boolean;
    }
}

interface CollapsibleContent {
    elements: ReactElement[];
    elementNameSingular: string;
    elementNamePlural: string;
    separatorText?: string;
}

export const InternalTypeDefinition: React.FC<InternalTypeDefinition.Props> = ({
    typeShape,
    isCollapsible,
    anchorIdParts,
    route,
    defaultExpandAll = false,
}) => {
    const { hydrated } = useNavigationContext();
    const { resolveTypeById } = useApiDefinitionContext();
    const router = useRouter();

    const collapsableContent = useMemo(
        () =>
            visitDiscriminatedUnion(typeShape, "type")._visit<CollapsibleContent | undefined>({
                alias: () => undefined,
                object: (object) => ({
                    elements: getAllObjectProperties(object, resolveTypeById).map((property) => (
                        <ObjectProperty
                            key={property.key}
                            property={property}
                            anchorIdParts={[...anchorIdParts, property.key]}
                            applyErrorStyles={false}
                            route={route}
                            defaultExpandAll={defaultExpandAll}
                        />
                    )),
                    elementNameSingular: "property",
                    elementNamePlural: "properties",
                }),
                undiscriminatedUnion: (union) => ({
                    elements: union.variants
                        .sort((v1, v2) => {
                            if (v1.type.type === "id") {
                                return v2.type.type === "id" ? 0 : -1;
                            }
                            return v2.type.type !== "id" ? 0 : 1;
                        })
                        .map((variant, variantIdx) => (
                            <UndiscriminatedUnionVariant
                                key={variantIdx}
                                unionVariant={variant}
                                anchorIdParts={[...anchorIdParts, variant.displayName ?? variantIdx.toString()]}
                                applyErrorStyles={false}
                                route={route}
                                defaultExpandAll={defaultExpandAll}
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
                            route={route}
                            defaultExpandAll={defaultExpandAll}
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
                _other: () => undefined,
            }),
        [typeShape, resolveTypeById, anchorIdParts, route, defaultExpandAll]
    );

    const anchorIdSoFar = getAnchorId(anchorIdParts);
    const matchesAnchorLink = router.asPath.startsWith(`${route}#${anchorIdSoFar}-`);
    const {
        value: isCollapsed,
        toggleValue: toggleIsCollapsed,
        setValue: setCollapsed,
    } = useBooleanState(!defaultExpandAll);

    useEffect(() => {
        setCollapsed(!matchesAnchorLink && !defaultExpandAll);
    }, [defaultExpandAll, matchesAnchorLink, setCollapsed]);

    const { isHovering, ...containerCallbacks } = useIsHovering();

    const contextValue = useTypeDefinitionContext();
    const collapsibleContentContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            isRootTypeDefinition: false,
        }),
        [contextValue]
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
        <div className="mt-2 flex flex-col">
            <div className="flex flex-col items-start">
                {collapsableContent.elementNameSingular !== "enum value" ? (
                    <div
                        className={classNames(
                            "border-border-default-light dark:border-border-default-dark flex flex-col overflow-visible rounded border",
                            {
                                "w-full": !isCollapsed,
                                "w-fit": isCollapsed,
                            }
                        )}
                    >
                        <div
                            {...containerCallbacks}
                            className={classNames(
                                "flex gap-1 items-center border-b hover:bg-tag-default-light dark:hover:bg-tag-default-dark cursor-pointer px-2 py-1 transition t-muted",
                                {
                                    "border-transparent": isCollapsed,
                                    "border-border-default-light dark:border-border-default-dark": !isCollapsed,
                                }
                            )}
                            onClick={(e) => {
                                toggleIsCollapsed();
                                e.stopPropagation();
                            }}
                        >
                            <Icon
                                className={classNames("transition", {
                                    "rotate-45": isCollapsed,
                                })}
                                icon={IconNames.CROSS}
                            />
                            <div
                                className={classNames(styles.showPropertiesButton, "select-none whitespace-nowrap")}
                                data-show-text={showText}
                            >
                                {isCollapsed ? showText : hideText}
                            </div>
                        </div>
                        <Collapse
                            isOpen={!isCollapsed}
                            transitionDuration={!hydrated ? 0 : 200}
                            className={classNames("transition", { "w-0": isCollapsed, "w-full": !isCollapsed })}
                        >
                            <TypeDefinitionContext.Provider value={collapsibleContentContextValue}>
                                <TypeDefinitionDetails
                                    elements={collapsableContent.elements}
                                    separatorText={collapsableContent.separatorText}
                                />
                            </TypeDefinitionContext.Provider>
                        </Collapse>
                    </div>
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
        </div>
    );
};
