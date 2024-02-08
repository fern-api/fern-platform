import { ResolvedTypeReference, ResolvedUndiscriminatedUnionShapeVariant } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { ReactElement, useCallback } from "react";
import { ApiPageDescription } from "../../ApiPageDescription";
import { EndpointAvailabilityTag } from "../../endpoints/EndpointAvailabilityTag";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeReferenceDefinitions } from "../type-reference/InternalTypeReferenceDefinitions";
import { renderTypeShorthand } from "../type-shorthand/TypeShorthand";

type IconInfo = {
    content: string;
    size: number;
};

function getIconInfoForTypeReference(typeRef: ResolvedTypeReference): IconInfo | null {
    return visitDiscriminatedUnion(typeRef, "type")._visit<IconInfo | null>({
        string: () => ({ content: "abc", size: 6 }),
        boolean: () => ({ content: "true", size: 6 }),
        integer: () => ({ content: "123", size: 6 }),
        double: () => ({ content: "1.2", size: 6 }),
        long: () => ({ content: "123", size: 6 }),
        datetime: () => ({ content: "abc", size: 6 }),
        uuid: () => ({ content: "abc", size: 6 }),
        base64: () => ({ content: "abc", size: 6 }),
        date: () => ({ content: "abc", size: 6 }),
        object: () => null,
        undiscriminatedUnion: () => null,
        discriminatedUnion: () => null,
        enum: () => null,
        optional: (optional) => getIconInfoForTypeReference(optional.shape),
        list: (list) => getIconInfoForTypeReference(list.shape),
        set: (set) => getIconInfoForTypeReference(set.shape),
        map: () => ({ content: "{}", size: 9 }),
        booleanLiteral: () => ({ content: "!", size: 6 }),
        stringLiteral: () => ({ content: "!", size: 6 }),
        unknown: () => ({ content: "{}", size: 6 }),
        _other: () => null,
        reference: (reference) => getIconInfoForTypeReference(reference.shape()),
    });
}

function getIconForTypeReference(typeRef: ResolvedTypeReference): ReactElement | null {
    const info = getIconInfoForTypeReference(typeRef);
    if (info == null) {
        return null;
    }
    const { content, size } = info;
    return (
        <div
            className="border-default flex size-6 items-center justify-center rounded border"
            style={{ fontSize: size }}
        >
            {content}
        </div>
    );
}

export declare namespace UndiscriminatedUnionVariant {
    export interface Props {
        unionVariant: ResolvedUndiscriminatedUnionShapeVariant;
        anchorIdParts: string[];
        applyErrorStyles: boolean;
        route: string;
        defaultExpandAll?: boolean;
        idx: number;
    }
}

export const UndiscriminatedUnionVariant: React.FC<UndiscriminatedUnionVariant.Props> = ({
    unionVariant,
    anchorIdParts,
    applyErrorStyles,
    route,
    defaultExpandAll = false,
    idx,
}) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();
    const contextValue = useTypeDefinitionContext();
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath: [...contextValue.jsonPropertyPath],
        }),
        [contextValue],
    );

    return (
        <div
            className={classNames("flex flex-col py-3", {
                "px-3": !isRootTypeDefinition,
            })}
        >
            <div className="flex flex-col gap-2">
                <div className="t-muted flex items-center space-x-2.5">
                    {getIconForTypeReference(unionVariant.shape)}
                    {unionVariant.displayName == null ? null : (
                        <span className="t-default text-sm">
                            {unionVariant.displayName.split(" ").length > 6
                                ? `Variant ${idx + 1}`
                                : unionVariant.displayName}
                        </span>
                    )}
                    <span className="t-muted text-xs">{renderTypeShorthand(unionVariant.shape)}</span>
                    {unionVariant.availability != null && (
                        <EndpointAvailabilityTag availability={unionVariant.availability} minimal={true} />
                    )}
                </div>
                <ApiPageDescription isMarkdown={true} description={unionVariant.description} className="text-sm" />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeReferenceDefinitions
                        shape={unionVariant.shape}
                        anchorIdParts={anchorIdParts}
                        isCollapsible
                        applyErrorStyles={applyErrorStyles}
                        route={route}
                        defaultExpandAll={defaultExpandAll}
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
