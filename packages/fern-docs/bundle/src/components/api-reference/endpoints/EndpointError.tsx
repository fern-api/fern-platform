import { MouseEventHandler, memo } from "react";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FernCollapse } from "@fern-docs/components";
import { AvailabilityBadge } from "@fern-docs/components/badges";
import cn from "clsx";

import { MdxContent } from "../../mdx/MdxContent";
import { renderTypeShorthand } from "../../type-shorthand";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";

export declare namespace EndpointError {
  export interface Props {
    error: ApiDefinition.ErrorResponse;
    isFirst: boolean;
    isLast: boolean;
    isSelected: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>;
    anchorIdParts: readonly string[];
    slug: FernNavigation.Slug;
    availability: APIV1Read.Availability | null | undefined;
    types: Record<string, ApiDefinition.TypeDefinition>;
  }
}

export const EndpointError = memo<EndpointError.Props>(
  function EndpointErrorUnmemoized({
    error,
    isFirst,
    isLast,
    isSelected,
    onClick,
    anchorIdParts,
    slug,
    availability,
    types,
  }) {
    return (
      <button
        className={cn(
          "space hover:bg-tag-default-soft flex flex-col items-start px-3 py-3 transition-colors",
          {
            "bg-tag-default-soft": isSelected,
          },
          {
            "border-default border-b": !isLast,
          },
          {
            "rounded-t-md": isFirst,
            "rounded-b-md": isLast,
          }
        )}
        onClick={onClick}
      >
        <div className="flex items-baseline space-x-2">
          <div className="bg-tag-danger text-intent-danger rounded-lg px-2 py-1 text-xs">
            {error.statusCode}
          </div>
          <div className="t-muted text-left text-xs">{error.name}</div>
          {availability != null && (
            <AvailabilityBadge availability={availability} size="sm" rounded />
          )}
        </div>

        {error.shape != null && (
          <FernCollapse open={isSelected} className="w-full">
            <div className="space-y-2 pt-2">
              <div className="t-muted w-full text-start text-sm leading-7">
                <MdxContent
                  mdx={error.description}
                  fallback={`This error returns ${renderTypeShorthand(error.shape, { withArticle: true }, types)}.`}
                />
              </div>
              {shouldHideShape(error.shape, types) ? null : (
                <div className="w-full text-start">
                  <TypeReferenceDefinitions
                    isCollapsible
                    applyErrorStyles
                    shape={error.shape}
                    anchorIdParts={anchorIdParts}
                    slug={slug}
                    types={types}
                    isResponse={true}
                  />
                </div>
              )}
            </div>
          </FernCollapse>
        )}
      </button>
    );
  }
);

function shouldHideShape(
  shape: ApiDefinition.TypeShapeOrReference,
  types: Record<string, ApiDefinition.TypeDefinition>
): boolean {
  return visitDiscriminatedUnion(
    ApiDefinition.unwrapReference(shape, types).shape
  )._visit<boolean>({
    primitive: () => true,
    literal: () => true,
    object: (object) =>
      ApiDefinition.unwrapObjectType(object, types).properties.length === 0,
    undiscriminatedUnion: () => false,
    discriminatedUnion: () => false,
    enum: () => false,
    list: (value) => shouldHideShape(value.itemShape, types),
    set: (value) => shouldHideShape(value.itemShape, types),
    map: () => false,
    unknown: () => true,
    _other: () => true,
  });
}
