import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { memo } from "react";
import { FernErrorBoundary } from "../../../components/FernErrorBoundary";
import { TypeDefinitionContextProvider } from "../context/TypeDefinitionContextProvider";
import { InternalTypeReferenceDefinitions } from "./InternalTypeReferenceDefinitions";

export declare namespace TypeReferenceDefinitions {
  export interface Props {
    applyErrorStyles: boolean;
    isCollapsible: boolean;
    anchorIdParts: readonly string[];
    className?: string;
    slug: FernNavigation.Slug;
    shape: ApiDefinition.TypeShapeOrReference;
    types: Record<string, ApiDefinition.TypeDefinition>;
    isResponse?: boolean;
  }
}

export const TypeReferenceDefinitions = memo<TypeReferenceDefinitions.Props>(
  function TypeReferenceDefinitions({
    shape,
    isCollapsible,
    applyErrorStyles,

    anchorIdParts,
    className,
    slug,
    types,
    isResponse,
  }) {
    return (
      <FernErrorBoundary component="TypeReferenceDefinitions">
        <TypeDefinitionContextProvider isResponse={isResponse}>
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
  }
);
