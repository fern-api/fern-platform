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
                <div className="t-muted text-xs">
                    <TypeShorthand type={unionVariant.type} plural={false} />
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
