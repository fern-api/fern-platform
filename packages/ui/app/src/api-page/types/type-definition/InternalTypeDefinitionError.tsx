import { Collapse } from "@blueprintjs/core";
import { ResolvedTypeShape } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useBooleanState, useIsHovering } from "@fern-ui/react-commons";
import { Cross2Icon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { useRouter } from "next/router";
import React, { ReactElement, useCallback, useEffect, useMemo } from "react";
import { useNavigationContext } from "../../../navigation-context";
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
import styles from "./InternalTypeDefinitionError.module.scss";
import { TypeDefinitionDetails } from "./TypeDefinitionDetails";

export declare namespace InternalTypeDefinitionError {
    export interface Props {
        typeShape: ResolvedTypeShape;
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

export const InternalTypeDefinitionError: React.FC<InternalTypeDefinitionError.Props> = ({
    typeShape,
    isCollapsible,
    anchorIdParts,
    route,
    defaultExpandAll = false,
}) => {
    const { hydrated, justNavigated } = useNavigationContext();
    const router = useRouter();

    const collapsableContent = useMemo(
        () =>
            visitDiscriminatedUnion(typeShape, "type")._visit<CollapsibleContent | undefined>({
                object: (object) => ({
                    elements: object
                        .properties()
                        .map((property) => (
                            <ObjectProperty
                                key={property.key}
                                property={property}
                                anchorIdParts={[...anchorIdParts, property.key]}
                                route={route}
                                applyErrorStyles
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
            }),
        [typeShape, anchorIdParts, route],
    );

    const anchorIdSoFar = getAnchorId(anchorIdParts);
    const matchesAnchorLink = router.asPath.startsWith(`${route}#${anchorIdSoFar}.`);
    const {
        value: isCollapsed,
        toggleValue: toggleIsCollapsed,
        setValue: setCollapsed,
    } = useBooleanState(!defaultExpandAll);

    useEffect(() => {
        setCollapsed(!defaultExpandAll);
    }, [defaultExpandAll, setCollapsed]);

    useEffect(() => {
        setCollapsed(!matchesAnchorLink && !defaultExpandAll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
        <div className="mt-2 flex flex-col">
            <div className="flex flex-col items-start">
                <div
                    className={classNames("border-default flex flex-col overflow-visible rounded border", {
                        "w-full": !isCollapsed,
                        "w-fit": isCollapsed,
                    })}
                >
                    <div
                        {...containerCallbacks}
                        className={classNames(
                            "text-sm flex gap-1 items-center rounded border-b hover:bg-tag-default-light dark:hover:bg-tag-default-dark cursor-pointer px-2 py-1 transition t-muted",
                            {
                                "border-transparent": isCollapsed,
                                "border-concealed": !isCollapsed,
                            },
                        )}
                        onClick={(e) => {
                            toggleIsCollapsed();
                            e.stopPropagation();
                        }}
                    >
                        <Cross2Icon
                            className={classNames("transition", {
                                "rotate-45": isCollapsed,
                            })}
                        />
                        <div
                            className={classNames(styles.showPropertiesButton, "select-none whitespace-nowrap")}
                            data-show-text={showText}
                        >
                            {isCollapsed ? showText : hideText}
                        </div>
                    </div>
                    <Collapse isOpen={!isCollapsed} transitionDuration={!hydrated || justNavigated ? 0 : 200}>
                        <TypeDefinitionContext.Provider value={collapsibleContentContextValue}>
                            <TypeDefinitionDetails
                                elements={collapsableContent.elements}
                                separatorText={collapsableContent.separatorText}
                            />
                        </TypeDefinitionContext.Provider>
                    </Collapse>
                </div>
            </div>
        </div>
    );
};
