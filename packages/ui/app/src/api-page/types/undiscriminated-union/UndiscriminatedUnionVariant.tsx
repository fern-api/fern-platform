import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { useCallback } from "react";
import { ApiPageDescription } from "../../ApiPageDescription";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeReferenceDefinitions } from "../type-reference/InternalTypeReferenceDefinitions";
import { TypeShorthand } from "../type-shorthand/TypeShorthand";

type IconInfo = {
    content: string;
    size: number;
};

function getIconInfoForPrimitiveType(type: FernRegistryApiRead.PrimitiveType): IconInfo {
    switch (type.type) {
        case "integer":
        case "long":
        case "double":
            return type.type === "double"
                ? {
                      content: "1.2",
                      size: 6,
                  }
                : {
                      content: "123",
                      size: 6,
                  };
        case "boolean":
            return { content: "true", size: 6 };
        case "uuid":
        case "date":
        case "datetime":
        case "base64":
        case "string":
            return { content: "abc", size: 6 };
    }
}

function getIconInfoForTypeReference(typeRef: FernRegistryApiRead.TypeReference): IconInfo | null {
    switch (typeRef.type) {
        case "id":
            return null;
        case "primitive":
            return getIconInfoForPrimitiveType(typeRef.value);
        case "map":
            return { content: "{}", size: 9 };
        case "literal":
            return { content: "!", size: 9 };
        case "list":
        case "set":
        case "optional":
            return getIconInfoForTypeReference(typeRef.itemType);
        case "unknown":
            return { content: "{}", size: 9 };
    }
}

function getIconForTypeReference(typeRef: FernRegistryApiRead.TypeReference): JSX.Element | null {
    const info = getIconInfoForTypeReference(typeRef);
    if (info == null) {
        return null;
    }
    const { content, size } = info;
    return (
        <div
            className="border-border-default-light dark:border-border-default-dark flex h-6 w-6 items-center justify-center rounded border"
            style={{ fontSize: size }}
        >
            {content}
        </div>
    );
}

export declare namespace UndiscriminatedUnionVariant {
    export interface Props {
        unionVariant: FernRegistryApiRead.UndiscriminatedUnionVariant;
        anchorIdParts: string[];
        applyErrorStyles: boolean;
    }
}

export const UndiscriminatedUnionVariant: React.FC<UndiscriminatedUnionVariant.Props> = ({
    unionVariant,
    anchorIdParts,
    applyErrorStyles,
}) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();
    const contextValue = useTypeDefinitionContext();
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath: [...contextValue.jsonPropertyPath],
        }),
        [contextValue]
    );

    return (
        <div
            className={classNames("flex flex-col py-3", {
                "px-3": !isRootTypeDefinition,
            })}
        >
            <div className="flex flex-col">
                <div className="t-muted flex items-center space-x-2.5">
                    {getIconForTypeReference(unionVariant.type)}
                    {unionVariant.displayName == null ? null : (
                        <span className="t-primary text-sm">{unionVariant.displayName}</span>
                    )}
                    <span className="t-muted text-xs">
                        <TypeShorthand type={unionVariant.type} plural={false} />
                    </span>
                </div>
                <ApiPageDescription className="mt-2" description={unionVariant.description} isMarkdown />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeReferenceDefinitions
                        type={unionVariant.type}
                        anchorIdParts={anchorIdParts}
                        isCollapsible
                        applyErrorStyles={applyErrorStyles}
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
