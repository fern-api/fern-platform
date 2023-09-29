import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { useCallback } from "react";
import { toTitleCase } from "../../../util/string";
import { ApiPageDescription } from "../../ApiPageDescription";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeReferenceDefinitions } from "../type-reference/InternalTypeReferenceDefinitions";
import { TypeShorthand } from "../type-shorthand/TypeShorthand";

function getIconContentForPrimitiveType(type: FernRegistryApiRead.PrimitiveType) {
    switch (type.type) {
        case "integer":
        case "long":
        case "double":
            return type.type === "double" ? "1.2" : "123";
        case "boolean":
            return "true";
        case "uuid":
        case "date":
        case "datetime":
        case "base64":
        case "string":
            return "abc";
    }
}

function getIconContentForTypeReference(typeRef: FernRegistryApiRead.TypeReference): string | null {
    switch (typeRef.type) {
        case "id":
            return null;
        case "primitive":
            return getIconContentForPrimitiveType(typeRef.value);
        case "map":
            return "<K,V>";
        case "literal":
            return "!";
        case "list":
        case "set":
        case "optional":
            return getIconContentForTypeReference(typeRef.itemType);
        case "unknown":
            return "?";
    }
}

function getIconForTypeReference(typeRef: FernRegistryApiRead.TypeReference): JSX.Element | null {
    const content = getIconContentForTypeReference(typeRef);
    if (content == null) {
        return null;
    }
    return (
        <div className="border-border-default-light dark:border-border-default-dark flex h-6 w-6 items-center justify-center rounded border text-[6px]">
            {content}
        </div>
    );
}

export declare namespace UndiscriminatedUnionVariant {
    export interface Props {
        unionVariant: FernRegistryApiRead.UndiscriminatedUnionVariant;
        anchorIdParts: string[];
    }
}

export const UndiscriminatedUnionVariant: React.FC<UndiscriminatedUnionVariant.Props> = ({
    unionVariant,
    anchorIdParts,
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
                    />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
