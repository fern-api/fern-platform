import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { memo } from "react";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { JsonPropertyPath } from "../../examples/JsonPropertyPath";
import { TypeDefinitionContextProvider } from "../context/TypeDefinitionContextProvider";
import { InternalTypeReferenceDefinitions } from "./InternalTypeReferenceDefinitions";

export declare namespace TypeReferenceDefinitions {
    export interface Props {
        applyErrorStyles: boolean;
        isCollapsible: boolean;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        className?: string;
        shape: ApiDefinition.TypeShapeOrReference;
        types: Record<string, ApiDefinition.TypeDefinition>;
        isResponse?: boolean;
    }
}

export const TypeReferenceDefinitions = memo<TypeReferenceDefinitions.Props>(function TypeReferenceDefinitions({
    shape,
    isCollapsible,
    applyErrorStyles,
    onHoverProperty,
    className,
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
                    types={types}
                />
            </TypeDefinitionContextProvider>
        </FernErrorBoundary>
    );
});
