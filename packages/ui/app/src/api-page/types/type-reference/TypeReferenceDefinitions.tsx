import { memo } from "react";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { ResolvedTypeDefinition, ResolvedTypeShape } from "../../../util/resolver";
import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import { TypeDefinitionContextProvider } from "../context/TypeDefinitionContextProvider";
import { InternalTypeReferenceDefinitions } from "./InternalTypeReferenceDefinitions";

export declare namespace TypeReferenceDefinitions {
    export interface Props {
        shape: ResolvedTypeShape;
        applyErrorStyles: boolean;
        isCollapsible: boolean;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        className?: string;
        route: string;
        defaultExpandAll?: boolean;
        types: Record<string, ResolvedTypeDefinition>;
        isResponse?: boolean;
    }
}

export const TypeReferenceDefinitions = memo<TypeReferenceDefinitions.Props>(function TypeReferenceDefinitions({
    shape,
    isCollapsible,
    applyErrorStyles,
    onHoverProperty,
    anchorIdParts,
    className,
    route,
    defaultExpandAll = false,
    types,
    isResponse,
}) {
    return (
        <FernErrorBoundary component="TypeReferenceDefinitions">
            <TypeDefinitionContextProvider onHoverProperty={onHoverProperty} isResponse={isResponse}>
                <InternalTypeReferenceDefinitions
                    shape={shape}
                    isCollapsible={isCollapsible}
                    applyErrorStyles={applyErrorStyles}
                    className={className}
                    anchorIdParts={anchorIdParts}
                    route={route}
                    defaultExpandAll={defaultExpandAll}
                    types={types}
                />
            </TypeDefinitionContextProvider>
        </FernErrorBoundary>
    );
});
