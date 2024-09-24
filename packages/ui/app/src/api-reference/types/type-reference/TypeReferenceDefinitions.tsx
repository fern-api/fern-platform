import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { memo } from "react";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { ResolvedTypeDefinition, ResolvedTypeShape } from "../../../resolver/types";
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
        slug: FernNavigation.Slug;
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
    slug,
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
                    slug={slug}
                    types={types}
                />
            </TypeDefinitionContextProvider>
        </FernErrorBoundary>
    );
});
